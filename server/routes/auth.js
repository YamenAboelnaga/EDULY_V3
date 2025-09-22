const express = require('express');
const { verifySupabaseToken, createRateLimit, securityMonitoring } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Apply security monitoring to all auth routes
router.use(securityMonitoring);

/**
 * GET /api/auth/me - Get current user profile
 */
router.get('/me', verifySupabaseToken, createRateLimit(60, 60000), async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        email_confirmed_at: req.user.email_confirmed_at,
        last_sign_in_at: req.user.last_sign_in_at
      },
      profile: req.profile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/auth/profile - Update user profile
 */
router.put('/profile', verifySupabaseToken, createRateLimit(10, 60000), async (req, res) => {
  try {
    const { first_name, last_name, phone, grade, school } = req.body;
    
    // Validate input data
    const allowedFields = ['first_name', 'last_name', 'phone', 'grade', 'school'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ profile: data });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/change-password - Change user password
 */
router.post('/change-password', verifySupabaseToken, createRateLimit(5, 3600000), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabaseAdmin.auth.signInWithPassword({
      email: req.user.email,
      password: currentPassword
    });

    if (verifyError) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.id,
      { password: newPassword }
    );

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Update password change timestamp
    await supabaseAdmin
      .from('user_profiles')
      .update({ password_changed_at: new Date().toISOString() })
      .eq('user_id', req.user.id);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/sessions - Get user sessions
 */
router.get('/sessions', verifySupabaseToken, createRateLimit(30, 60000), async (req, res) => {
  try {
    const { data: sessions, error } = await supabaseAdmin
      .from('user_sessions')
      .select('id, ip_address, user_agent, is_active, created_at, last_activity_at')
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .order('last_activity_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/auth/sessions/:sessionId - Revoke a session
 */
router.delete('/sessions/:sessionId', verifySupabaseToken, createRateLimit(10, 60000), async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { error } = await supabaseAdmin
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/verify-email-resend - Resend email verification
 */
router.post('/verify-email-resend', createRateLimit(3, 3600000), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { error } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: email
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;