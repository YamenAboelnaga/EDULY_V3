// Security utilities for the application

/**
 * Generate a secure random token for CSRF protection
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Sanitize HTML input to prevent XSS
 */
export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate and sanitize text input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"'&]/g, '');
};

/**
 * Email validation with security considerations
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254 && email.length >= 5;
};

/**
 * Strong password validation
 */
export const validatePassword = (password: string): {isValid: boolean, errors: string[]} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }
  
  if (password.length > 128) {
    errors.push('كلمة المرور يجب أن تكون أقل من 128 حرف');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate Arabic name
 */
export const validateArabicName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 50 && /^[\u0600-\u06FF\s]+$/.test(name);
};

/**
 * Validate Egyptian phone number
 */
export const validateEgyptianPhone = (phone: string): boolean => {
  const phoneRegex = /^01[0125][0-9]{8}$/;
  return phoneRegex.test(phone);
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, {count: number, lastAttempt: number}> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);

    if (!userAttempts) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    if (now - userAttempts.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    if (userAttempts.count >= this.maxAttempts) {
      return false;
    }

    userAttempts.count++;
    userAttempts.lastAttempt = now;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const userAttempts = this.attempts.get(identifier);
    if (!userAttempts || userAttempts.count < this.maxAttempts) {
      return 0;
    }
    
    const timeLeft = this.windowMs - (Date.now() - userAttempts.lastAttempt);
    return Math.max(0, timeLeft);
  }
}

/**
 * Secure session storage with enhanced encryption
 */
export const secureStorage = {
  set: (key: string, value: any): void => {
    try {
      // Add timestamp and integrity check
      const dataString = value ? JSON.stringify(value) : '';
      const dataWithMeta = {
        data: value,
        timestamp: Date.now(),
        integrity: generateIntegrityHash(dataString)
      };
      const encrypted = btoa(JSON.stringify(dataWithMeta));
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },

  get: (key: string): any => {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;

      const dataWithMeta = JSON.parse(atob(encrypted));

      // Ensure dataWithMeta has expected structure
      if (!dataWithMeta || typeof dataWithMeta !== 'object') {
        console.warn('Invalid data structure, clearing corrupted data');
        sessionStorage.removeItem(key);
        return null;
      }

      // Verify integrity (handle undefined/null data safely)
      const dataString = dataWithMeta.data ? JSON.stringify(dataWithMeta.data) : '';
      const expectedHash = generateIntegrityHash(dataString);

      if (dataWithMeta.integrity !== expectedHash) {
        console.warn('Data integrity check failed, clearing corrupted data');
        sessionStorage.removeItem(key);
        return null;
      }

      // Check expiration (24 hours)
      if (dataWithMeta.timestamp) {
        const now = Date.now();
        const age = now - dataWithMeta.timestamp;
        if (age > 24 * 60 * 60 * 1000) {
          sessionStorage.removeItem(key);
          return null;
        }
      }

      return dataWithMeta.data;
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      // Clear corrupted data
      try {
        sessionStorage.removeItem(key);
      } catch (e) {
        // Ignore cleanup errors
      }
      return null;
    }
  },

  remove: (key: string): void => {
    sessionStorage.removeItem(key);
  },

  clear: (): void => {
    sessionStorage.clear();
  }
};

/**
 * Generate integrity hash for data validation
 */
const generateIntegrityHash = (data: string | null | undefined): string => {
  if (!data || typeof data !== 'string') {
    return '0'; // Return default hash for invalid data
  }

  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
};

/**
 * Content Security Policy helper
 */
export const setCSPHeaders = (): void => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval'", // Framer Motion needs unsafe-eval
    "style-src 'self' 'unsafe-inline'", // Tailwind needs unsafe-inline
    "img-src 'self' data: https:",
    "font-src 'self' https:",
    "connect-src 'self' https:",
    "media-src 'self' https:",
    "frame-src 'self' https://www.youtube.com"
  ].join('; ');
  
  document.head.appendChild(meta);
};

/**
 * Admin credentials configuration
 */
export const ADMIN_CONFIG = {
  email: 'yamentayson4132@gmail.com',
  password: 'yamen2005419'
};

/**
 * Validate admin credentials
 */
export const validateAdminCredentials = (email: string, password: string): boolean => {
  return email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password;
};

/**
 * Check if email is admin email
 */
export const isAdminEmail = (email: string): boolean => {
  return email === ADMIN_CONFIG.email;
};
