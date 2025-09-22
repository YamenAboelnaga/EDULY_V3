import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client (safe for browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Types for our auth system
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  grade?: string;
  school?: string;
  role: 'student' | 'admin' | 'instructor';
  avatar_url?: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  last_login_at?: string;
  login_count: number;
  failed_login_attempts: number;
  account_locked_until?: string;
  two_factor_enabled: boolean;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SecurityLog {
  id: string;
  user_id?: string;
  event_type: string;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;
}