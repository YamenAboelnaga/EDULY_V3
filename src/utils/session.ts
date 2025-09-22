import { secureStorage, generateCSRFToken } from './security';

export interface UserSession {
  email: string;
  role: 'student' | 'admin';
  loginTime: string;
  lastActivity: string;
  sessionId: string;
  csrfToken: string;
  ipHash?: string;
  userAgent?: string;
}

export class SessionManager {
  private static readonly SESSION_KEY = 'eduly_session';
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /**
   * Create a new user session
   */
  static createSession(email: string, role: 'student' | 'admin'): void {
    const session: UserSession = {
      email,
      role,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      sessionId: this.generateSessionId(),
      csrfToken: generateCSRFToken(),
      userAgent: navigator.userAgent.substring(0, 200), // Limit length for security
    };

    secureStorage.set(this.SESSION_KEY, session);
    this.startActivityTracking();
  }

  /**
   * Get current user session
   */
  static getCurrentSession(): UserSession | null {
    const session = secureStorage.get(this.SESSION_KEY);
    
    if (!session) {
      return null;
    }

    // Check if session has expired
    if (this.isSessionExpired(session)) {
      this.clearSession();
      return null;
    }

    return session;
  }

  /**
   * Update last activity time
   */
  static updateActivity(): void {
    const session = this.getCurrentSession();
    if (session) {
      session.lastActivity = new Date().toISOString();
      secureStorage.set(this.SESSION_KEY, session);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }

  /**
   * Check if user is admin
   */
  static isAdmin(): boolean {
    const session = this.getCurrentSession();
    return session?.role === 'admin';
  }

  /**
   * Get user email
   */
  static getUserEmail(): string | null {
    const session = this.getCurrentSession();
    return session?.email || null;
  }

  /**
   * Clear user session (logout)
   */
  static clearSession(): void {
    secureStorage.remove(this.SESSION_KEY);
    this.stopActivityTracking();
  }

  /**
   * Check if session has expired
   */
  private static isSessionExpired(session: UserSession): boolean {
    const now = new Date().getTime();
    const loginTime = new Date(session.loginTime).getTime();
    const lastActivity = new Date(session.lastActivity).getTime();

    // Check absolute session timeout
    if (now - loginTime > this.SESSION_TIMEOUT) {
      return true;
    }

    // Check inactivity timeout
    if (now - lastActivity > this.ACTIVITY_TIMEOUT) {
      return true;
    }

    return false;
  }

  /**
   * Start tracking user activity
   */
  private static startActivityTracking(): void {
    // Update activity on user interaction
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      this.updateActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Store event listeners for cleanup
    (window as any).edulyActivityListeners = { events, updateActivity };
  }

  /**
   * Stop tracking user activity
   */
  private static stopActivityTracking(): void {
    const listeners = (window as any).edulyActivityListeners;
    if (listeners) {
      listeners.events.forEach((event: string) => {
        document.removeEventListener(event, listeners.updateActivity);
      });
      delete (window as any).edulyActivityListeners;
    }
  }

  /**
   * Require authentication for a function
   */
  static requireAuth<T extends any[], R>(
    fn: (...args: T) => R,
    redirectUrl: string = '/login'
  ): (...args: T) => R | void {
    return (...args: T): R | void => {
      if (!this.isAuthenticated()) {
        window.location.href = redirectUrl;
        return;
      }
      return fn(...args);
    };
  }

  /**
   * Require admin role for a function
   */
  static requireAdmin<T extends any[], R>(
    fn: (...args: T) => R,
    redirectUrl: string = '/'
  ): (...args: T) => R | void {
    return (...args: T): R | void => {
      if (!this.isAdmin()) {
        window.location.href = redirectUrl;
        return;
      }
      return fn(...args);
    };
  }

  /**
   * Generate a unique session ID
   */
  private static generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const random = Array.from(randomBytes, byte => byte.toString(36)).join('');
    return `${timestamp}-${random}`;
  }
}

// Initialize session check on page load
if (typeof window !== 'undefined') {
  // Check session on page load
  document.addEventListener('DOMContentLoaded', () => {
    const session = SessionManager.getCurrentSession();
    if (session) {
      SessionManager.startActivityTracking();
    }
  });

  // Check session periodically
  setInterval(() => {
    const session = SessionManager.getCurrentSession();
    if (!session && window.location.pathname !== '/' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
      window.location.href = '/';
    }
  }, 60000); // Check every minute
}
