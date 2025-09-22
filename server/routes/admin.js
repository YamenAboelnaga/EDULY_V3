const express = require('express');
const { verifySupabaseToken, requireAdmin, createRateLimit } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Apply auth and admin requirements to all admin routes
router.use(verifySupabaseToken);
router.use(requireAdmin);

/**
 * GET /api/admin/users - Get all users (admin only)
 */
router.get('/users', createRateLimit(100, 60000), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/users/:userId/role - Update user role
 */
router.put('/users/:userId/role', createRateLimit(20, 60000), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log the role change
    await supabaseAdmin.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: 'role_changed',
      p_ip_address: req.ip,
      p_user_agent: req.get('User-Agent'),
      p_metadata: { 
        new_role: role, 
        changed_by: req.user.id 
      },
      p_severity: 'warning'
    });

    res.json({ profile: data });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/users/:userId/lock - Lock/unlock user account
 */
router.post('/users/:userId/lock', createRateLimit(10, 60000), async (req, res) => {
  try {
    const { userId } = req.params;
    const { lock, duration = 24 } = req.body; // duration in hours

    const lockUntil = lock 
      ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
      : null;

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ 
        account_locked_until: lockUntil,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log the account lock/unlock
    await supabaseAdmin.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: lock ? 'account_locked' : 'account_unlocked',
      p_ip_address: req.ip,
      p_user_agent: req.get('User-Agent'),
      p_metadata: { 
        locked_until: lockUntil,
        duration_hours: duration,
        locked_by: req.user.id 
      },
      p_severity: 'warning'
    });

    res.json({ 
      message: lock ? 'Account locked successfully' : 'Account unlocked successfully',
      profile: data 
    });
  } catch (error) {
    console.error('Error locking/unlocking account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/security-logs - Get security logs
 */
router.get('/security-logs', createRateLimit(50, 60000), async (req, res) => {
  try {
    const { page = 1, limit = 50, severity = '', event_type = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('security_logs')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (event_type) {
      query = query.eq('event_type', event_type);
    }

    const { data: logs, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/dashboard-stats - Get admin dashboard statistics
 */
router.get('/dashboard-stats', createRateLimit(30, 60000), async (req, res) => {
  try {
    // Get user statistics
    const { data: userStats } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .neq('role', null);

    // Get recent security events
    const { data: recentEvents } = await supabaseAdmin
      .from('security_logs')
      .select('event_type, severity, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    // Calculate statistics
    const stats = {
      total_users: userStats?.length || 0,
      students: userStats?.filter(u => u.role === 'student').length || 0,
      instructors: userStats?.filter(u => u.role === 'instructor').length || 0,
      admins: userStats?.filter(u => u.role === 'admin').length || 0,
      recent_events: {
        total: recentEvents?.length || 0,
        critical: recentEvents?.filter(e => e.severity === 'critical').length || 0,
        warnings: recentEvents?.filter(e => e.severity === 'warning').length || 0,
        login_attempts: recentEvents?.filter(e => e.event_type.includes('login')).length || 0
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;