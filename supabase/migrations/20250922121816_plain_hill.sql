/*
  # Authentication and User Management Setup

  1. Security
    - Enable RLS on all tables
    - Create secure user profiles table
    - Add audit logging for security events
    - Set up rate limiting tracking

  2. Tables
    - `user_profiles` - Extended user information
    - `security_logs` - Track authentication events
    - `rate_limits` - Track login attempts for rate limiting

  3. Policies
    - Users can only access their own data
    - Admins have elevated permissions
    - Security logs are admin-only
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles table with enhanced security
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  grade text,
  school text,
  role text DEFAULT 'student' CHECK (role IN ('student', 'admin', 'instructor')),
  avatar_url text,
  is_email_verified boolean DEFAULT false,
  is_phone_verified boolean DEFAULT false,
  last_login_at timestamptz,
  login_count integer DEFAULT 0,
  failed_login_attempts integer DEFAULT 0,
  account_locked_until timestamptz,
  password_changed_at timestamptz DEFAULT now(),
  two_factor_enabled boolean DEFAULT false,
  two_factor_secret text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Security audit logs
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'login_success', 'login_failed', 'logout', 'password_reset_requested',
    'password_reset_completed', 'email_verification', 'account_locked',
    'suspicious_activity', 'token_refresh', 'profile_updated'
  )),
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at timestamptz DEFAULT now()
);

-- Rate limiting tracking
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user ID
  action_type text NOT NULL, -- 'login', 'signup', 'password_reset'
  attempt_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(identifier, action_type)
);

-- User sessions for enhanced tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token text NOT NULL UNIQUE,
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin policies for user_profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

-- RLS Policies for security_logs
CREATE POLICY "Only admins can view security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

CREATE POLICY "System can insert security logs"
  ON security_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for rate_limits
CREATE POLICY "System can manage rate limits"
  ON rate_limits
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Functions for security
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}',
  p_severity text DEFAULT 'info'
)
RETURNS void AS $$
BEGIN
  INSERT INTO security_logs (
    user_id, event_type, ip_address, user_agent, metadata, severity
  ) VALUES (
    p_user_id, p_event_type, p_ip_address, p_user_agent, p_metadata, p_severity
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier text,
  p_action_type text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean AS $$
DECLARE
  current_attempts integer;
  window_start timestamptz;
BEGIN
  -- Get current rate limit record
  SELECT attempt_count, window_start
  INTO current_attempts, window_start
  FROM rate_limits
  WHERE identifier = p_identifier AND action_type = p_action_type;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO rate_limits (identifier, action_type, attempt_count, window_start)
    VALUES (p_identifier, p_action_type, 1, now());
    RETURN true;
  END IF;

  -- Check if window has expired
  IF now() - window_start > (p_window_minutes || ' minutes')::interval THEN
    -- Reset the window
    UPDATE rate_limits
    SET attempt_count = 1, window_start = now(), blocked_until = NULL
    WHERE identifier = p_identifier AND action_type = p_action_type;
    RETURN true;
  END IF;

  -- Check if currently blocked
  IF blocked_until IS NOT NULL AND now() < blocked_until THEN
    RETURN false;
  END IF;

  -- Increment attempt count
  UPDATE rate_limits
  SET attempt_count = attempt_count + 1,
      blocked_until = CASE 
        WHEN attempt_count + 1 >= p_max_attempts 
        THEN now() + (p_window_minutes || ' minutes')::interval
        ELSE NULL
      END
  WHERE identifier = p_identifier AND action_type = p_action_type;

  -- Return whether request is allowed
  RETURN current_attempts < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'student');
  
  -- Log the signup event
  PERFORM log_security_event(
    NEW.id,
    'signup_success',
    NULL,
    NULL,
    jsonb_build_object('email', NEW.email),
    'info'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);