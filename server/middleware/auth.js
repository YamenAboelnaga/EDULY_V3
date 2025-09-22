const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Server-side Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Middleware to verify Supabase JWT tokens
 */
const verifySupabaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header',
        code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.substring(7);

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Get user profile with role information
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return res.status(401).json({ 
        error: 'User profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }

    // Check if account is locked
    if (profile.account_locked_until && new Date(profile.account_locked_until) > new Date()) {
      return res.status(423).json({ 
        error: 'Account is temporarily locked',
        code: 'ACCOUNT_LOCKED',
        locked_until: profile.account_locked_until
      });
    }

    // Attach user and profile to request
    req.user = user;
    req.profile = profile;
    req.token = token;

    // Log API access for security monitoring
    await logSecurityEvent(user.id, 'api_access', req.ip, req.get('User-Agent'), {
      endpoint: req.path,
      method: req.method
    });

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Middleware to require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.profile || req.profile.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  next();
};

/**
 * Middleware to require instructor role or higher
 */
const requireInstructor = (req, res, next) => {
  if (!req.profile || !['admin', 'instructor'].includes(req.profile.role)) {
    return res.status(403).json({ 
      error: 'Instructor access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  next();
};

/**
 * Rate limiting middleware
 */
const createRateLimit = (maxAttempts = 100, windowMs = 15 * 60 * 1000) => {
  return async (req, res, next) => {
    try {
      const identifier = req.user?.id || req.ip;
      const action = `api_${req.method.toLowerCase()}_${req.path}`;

      const { data: isAllowed } = await supabaseAdmin.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_action_type: action,
        p_max_attempts: maxAttempts,
        p_window_minutes: Math.floor(windowMs / (60 * 1000))
      });

      if (!isAllowed) {
        await logSecurityEvent(req.user?.id, 'rate_limit_exceeded', req.ip, req.get('User-Agent'), {
          endpoint: req.path,
          method: req.method
        }, 'warning');

        return res.status(429).json({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retry_after: Math.ceil(windowMs / 1000)
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next(); // Continue on error to avoid blocking legitimate requests
    }
  };
};

/**
 * Log security events
 */
const logSecurityEvent = async (userId, eventType, ipAddress, userAgent, metadata = {}, severity = 'info') => {
  try {
    await supabaseAdmin.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_metadata: metadata,
      p_severity: severity
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

/**
 * Security monitoring middleware
 */
const securityMonitoring = async (req, res, next) => {
  // Monitor for suspicious patterns
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|create|alter)\b/i, // SQL injection attempts
    /<script|javascript:|data:/i, // XSS attempts
    /\.\.\//g, // Path traversal attempts
  ];

  const requestData = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));

  if (isSuspicious) {
    await logSecurityEvent(
      req.user?.id,
      'suspicious_activity',
      req.ip,
      req.get('User-Agent'),
      {
        endpoint: req.path,
        method: req.method,
        suspicious_data: requestData.substring(0, 1000) // Limit size
      },
      'critical'
    );

    // Send alert (implement webhook to Slack/email)
    await sendSecurityAlert('Suspicious activity detected', {
      user_id: req.user?.id,
      ip: req.ip,
      endpoint: req.path,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Send security alerts
 */
const sendSecurityAlert = async (message, data) => {
  try {
    if (process.env.SLACK_WEBHOOK_URL) {
      const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 EDULY Security Alert: ${message}`,
          attachments: [{
            color: 'danger',
            fields: Object.entries(data).map(([key, value]) => ({
              title: key,
              value: String(value),
              short: true
            }))
          }]
        })
      });
    }
  } catch (error) {
    console.error('Failed to send security alert:', error);
  }
};

module.exports = {
  verifySupabaseToken,
  requireAdmin,
  requireInstructor,
  createRateLimit,
  securityMonitoring,
  logSecurityEvent
};