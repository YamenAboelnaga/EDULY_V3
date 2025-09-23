/*
  # Authentication System Setup

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text, unique)
      - `first_name` (text, optional)
      - `last_name` (text, optional)
      - `phone` (text, optional)
      - `grade` (text, optional)
      - `school` (text, optional)
      - `role` (text, default 'student')
      - `avatar_url` (text, optional)
      - `is_email_verified` (boolean, default false)
      - `is_phone_verified` (boolean, default false)
      - `last_login_at` (timestamptz, optional)
      - `login_count` (integer, default 0)
      - `failed_login_attempts` (integer, default 0)
      - `account_locked_until` (timestamptz, optional)
      - `password_changed_at` (timestamptz, default now)
      - `two_factor_enabled` (boolean, default false)
      - `two_factor_secret` (text, optional)
      - `preferences` (jsonb, default {})
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

    - `security_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, optional reference to auth.users)
      - `event_type` (text, constrained values)
      - `ip_address` (inet, optional)
      - `user_agent` (text, optional)
      - `metadata` (jsonb, default {})
      - `severity` (text, default 'info')
      - `created_at` (timestamptz, default now)

    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `session_token` (text, unique)
      - `ip_address` (inet, optional)
      - `user_agent` (text, optional)
      - `is_active` (boolean, default true)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz, default now)
      - `last_activity_at` (timestamptz, default now)

    - `rate_limits`
      - `id` (uuid, primary key)
      - `identifier` (text)
      - `action_type` (text)
      - `attempt_count` (integer, default 1)
      - `window_start` (timestamptz, default now)
      - `blocked_until` (timestamptz, optional)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Add trigger for automatic user profile creation
    - Add function for updating timestamps

  3. Functions
    - `update_updated_at_column()` - Updates updated_at timestamp
    - `handle_new_user()` - Creates user profile on signup
    - `log_security_event()` - RPC function for logging security events
*/

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
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

-- Create security_logs table
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

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now()
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action_type text NOT NULL,
  attempt_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(identifier, action_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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
CREATE POLICY "System can insert security logs"
  ON security_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

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

-- RLS Policies for rate_limits
CREATE POLICY "System can manage rate limits"
  ON rate_limits
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create RPC function for logging security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid DEFAULT NULL,
  p_event_type text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}',
  p_severity text DEFAULT 'info'
)
RETURNS void AS $$
BEGIN
  INSERT INTO security_logs (user_id, event_type, ip_address, user_agent, metadata, severity)
  VALUES (p_user_id, p_event_type, p_ip_address, p_user_agent, p_metadata, p_severity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;