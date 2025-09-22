import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { user, profile } = useAuth();

  useEffect(() => {
    // Set up security monitoring
    const setupSecurityMonitoring = () => {
      // Monitor for suspicious activity
      let suspiciousActivityCount = 0;
      const maxSuspiciousActivity = 5;
      const timeWindow = 5 * 60 * 1000; // 5 minutes

      // Track rapid navigation (potential bot behavior)
      let navigationCount = 0;
      const resetNavigationCount = () => {
        navigationCount = 0;
      };

      const handleNavigation = () => {
        navigationCount++;
        if (navigationCount > 20) { // More than 20 navigations in 5 minutes
          logSuspiciousActivity('rapid_navigation', { count: navigationCount });
          suspiciousActivityCount++;
        }
      };

      // Track failed API calls
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args);
          
          if (response.status === 401 || response.status === 403) {
            suspiciousActivityCount++;
            if (suspiciousActivityCount >= maxSuspiciousActivity) {
              await logSuspiciousActivity('multiple_auth_failures', {
                count: suspiciousActivityCount,
                endpoint: args[0]
              });
            }
          }
          
          return response;
        } catch (error) {
          return originalFetch(...args);
        }
      };

      // Monitor console access (potential debugging attempts)
      const originalLog = console.log;
      console.log = (...args) => {
        if (args.some(arg => typeof arg === 'string' && arg.includes('supabase'))) {
          logSuspiciousActivity('console_access_supabase', { args: args.slice(0, 3) });
        }
        return originalLog(...args);
      };

      // Set up intervals
      const navigationInterval = setInterval(resetNavigationCount, timeWindow);
      
      // Event listeners
      window.addEventListener('popstate', handleNavigation);
      window.addEventListener('pushstate', handleNavigation);

      // Cleanup function
      return () => {
        clearInterval(navigationInterval);
        window.removeEventListener('popstate', handleNavigation);
        window.removeEventListener('pushstate', handleNavigation);
        window.fetch = originalFetch;
        console.log = originalLog;
      };
    };

    // Log suspicious activity
    const logSuspiciousActivity = async (activityType: string, metadata: any) => {
      try {
        await supabase.rpc('log_security_event', {
          p_user_id: user?.id || null,
          p_event_type: 'suspicious_activity',
          p_ip_address: null,
          p_user_agent: navigator.userAgent,
          p_metadata: {
            activity_type: activityType,
            ...metadata,
            timestamp: new Date().toISOString()
          },
          p_severity: 'warning'
        });
      } catch (error) {
        console.error('Failed to log suspicious activity:', error);
      }
    };

    // Set up monitoring only for authenticated users
    if (user) {
      const cleanup = setupSecurityMonitoring();
      return cleanup;
    }
  }, [user, profile]);

  // Monitor for tab visibility changes (potential security concern)
  useEffect(() => {
    let tabSwitchCount = 0;
    const maxTabSwitches = 10;

    const handleVisibilityChange = async () => {
      if (document.hidden && user) {
        tabSwitchCount++;
        
        if (tabSwitchCount > maxTabSwitches) {
          try {
            await supabase.rpc('log_security_event', {
              p_user_id: user.id,
              p_event_type: 'excessive_tab_switching',
              p_ip_address: null,
              p_user_agent: navigator.userAgent,
              p_metadata: { count: tabSwitchCount },
              p_severity: 'warning'
            });
          } catch (error) {
            console.error('Failed to log tab switching:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  return <>{children}</>;
};