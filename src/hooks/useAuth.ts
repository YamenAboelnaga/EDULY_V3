import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ error?: AuthError }>;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: Error }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Security event logging
  const logSecurityEvent = async (
    eventType: string,
    metadata: Record<string, any> = {},
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
  ) => {
    try {
      await supabase.rpc('log_security_event', {
        p_user_id: user?.id || null,
        p_event_type: eventType,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
        p_metadata: metadata,
        p_severity: severity
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  // Load user profile
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (initialSession?.user && mounted) {
          setUser(initialSession.user);
          setSession(initialSession);
          
          const userProfile = await loadUserProfile(initialSession.user.id);
          if (userProfile && mounted) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          const userProfile = await loadUserProfile(session.user.id);
          if (userProfile && mounted) {
            setProfile(userProfile);
          }

          if (event === 'SIGNED_IN') {
            await logSecurityEvent('login_success', {
              email: session.user.email,
              provider: session.user.app_metadata?.provider || 'email'
            });
          }
        } else {
          setProfile(null);
          if (event === 'SIGNED_OUT') {
            await logSecurityEvent('logout');
          }
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign up function (بدون rate limiting)
  const signUp = async (
    email: string, 
    password: string, 
    userData: Partial<UserProfile> = {}
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            phone: userData.phone || '',
            grade: userData.grade || '',
            school: userData.school || ''
          }
        }
      });

      if (error) {
        await logSecurityEvent('signup_failed', { email, error: error.message }, 'warning');
        return { error };
      }

      if (data.user && !data.session) {
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب",
        });
      }

      return { error: undefined };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Sign in function (بدون rate limiting)
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        await logSecurityEvent('login_failed', { email, error: error.message }, 'warning');
        return { error };
      }

      if (data.user) {
        await supabase
          .from('user_profiles')
          .update({
            last_login_at: new Date().toISOString(),
            login_count: supabase.sql`login_count + 1`,
            failed_login_attempts: 0
          })
          .eq('user_id', data.user.id);
      }

      return { error: undefined };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await logSecurityEvent('logout');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "خطأ في تسجيل الخروج",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset password function (بدون rate limiting)
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (!error) {
        await logSecurityEvent('password_reset_requested', { email });
        toast({
          title: "تم إرسال رابط إعادة التعيين",
          description: "يرجى التحقق من بريدك الإلكتروني",
        });
      }

      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: new Error('User not authenticated') };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        return { error };
      }

      const updatedProfile = await loadUserProfile(user.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      await logSecurityEvent('profile_updated', { updated_fields: Object.keys(updates) });

      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ التغييرات بنجاح",
      });

      return { error: undefined };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error as Error };
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        await signOut();
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession
  };
};

export { AuthContext };
