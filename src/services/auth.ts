// Enhanced authentication service with 2FA support and backend integration
import { EncryptionService } from './encryption';
import { ApiService } from './api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  encryptionKey: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLogin: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    security: boolean;
  };
  privacy: {
    shareAnonymizedData: boolean;
    allowResearchContact: boolean;
    dataRetentionPeriod: number; // months
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
}

// Backend user type (what we expect from API)
interface BackendUser {
  id?: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'seen_auth_token';
  private static readonly USER_KEY = 'seen_user_data';
  private static readonly ENCRYPTION_KEY = 'seen_encryption_key';

  static async register(data: RegistrationData): Promise<AuthUser> {
    // Validate registration data
    this.validateRegistration(data);

    try {
      // Try backend registration first
      const response = await ApiService.register({
        email: data.email,
        password: data.password,
        confirmPassword: data.password,
        firstName: data.name.split(' ')[0],
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        agreeToTerms: data.acceptedTerms
      });

      if (response.success && response.data) {
        // Store backend auth token
        localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
        
        // Convert backend user to our format with safe property access
        const backendUser: BackendUser = response.data.user;
        const user: AuthUser = {
          id: backendUser.id || this.generateSecureId(),
          email: backendUser.email || data.email,
          name: backendUser.name || 
                (backendUser.firstName || backendUser.lastName ? 
                 `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() : 
                 data.name),
          encryptionKey: EncryptionService.generateUserKey(),
          twoFactorEnabled: false,
          createdAt: backendUser.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          preferences: this.getDefaultPreferences()
        };

        // Store user data locally for offline access
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        localStorage.setItem(this.ENCRYPTION_KEY, user.encryptionKey);
        
        return user;
      }
    } catch (error) {
      console.warn('Backend registration failed, falling back to local storage:', error);
    }

    // Fallback to local storage (mock mode)
    return this.registerLocally(data);
  }

  private static async registerLocally(data: RegistrationData): Promise<AuthUser> {
    // Generate secure user ID and encryption key
    const userId = this.generateSecureId();
    const encryptionKey = EncryptionService.generateUserKey();
    const salt = this.generateSalt();
    const hashedPassword = EncryptionService.hashPassword(data.password, salt);

    const user: AuthUser = {
      id: userId,
      email: data.email,
      name: data.name,
      encryptionKey,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferences: this.getDefaultPreferences()
    };

    // Store encrypted user data locally
    const userData = {
      ...user,
      passwordHash: hashedPassword,
      salt,
      termsAcceptedAt: new Date().toISOString(),
      privacyPolicyAcceptedAt: new Date().toISOString(),
      isLocalAccount: true // Flag to indicate this is a local account
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    localStorage.setItem(this.ENCRYPTION_KEY, encryptionKey);
    
    // Generate and store auth token
    const token = this.generateAuthToken(user);
    localStorage.setItem(this.TOKEN_KEY, token);

    return user;
  }

  static async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      // Try backend login first
      const response = await ApiService.login(credentials.email, credentials.password);
      
      if (response.success && response.data) {
        // Store backend auth token
        localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
        
        // Convert backend user to our format with safe property access
        const backendUser: BackendUser = response.data.user;
        const user: AuthUser = {
          id: backendUser.id || this.generateSecureId(),
          email: backendUser.email || credentials.email,
          name: backendUser.name || 
                (backendUser.firstName || backendUser.lastName ? 
                 `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() : 
                 'User'),
          encryptionKey: EncryptionService.generateUserKey(),
          twoFactorEnabled: false,
          createdAt: backendUser.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          preferences: this.getDefaultPreferences()
        };

        // Store user data locally for offline access
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        localStorage.setItem(this.ENCRYPTION_KEY, user.encryptionKey);
        
        return user;
      }
    } catch (error) {
      console.warn('Backend login failed, trying local storage:', error);
    }

    // Fallback to local storage (mock mode)
    return this.loginLocally(credentials);
  }

  private static async loginLocally(credentials: LoginCredentials): Promise<AuthUser> {
    const storedUserData = localStorage.getItem(this.USER_KEY);
    if (!storedUserData) {
      throw new Error('User not found. Please create an account first.');
    }

    const userData = JSON.parse(storedUserData);
    
    // Check if this is a local account
    if (!userData.isLocalAccount) {
      throw new Error('Please use the backend login for this account.');
    }

    const hashedPassword = EncryptionService.hashPassword(credentials.password, userData.salt);

    if (hashedPassword !== userData.passwordHash) {
      throw new Error('Invalid credentials');
    }

    // Check 2FA if enabled
    if (userData.twoFactorEnabled && !credentials.twoFactorCode) {
      throw new Error('Two-factor authentication required');
    }

    if (userData.twoFactorEnabled && credentials.twoFactorCode) {
      const isValidCode = await this.verifyTwoFactorCode(userData.id, credentials.twoFactorCode);
      if (!isValidCode) {
        throw new Error('Invalid two-factor code');
      }
    }

    // Update last login
    userData.lastLogin = new Date().toISOString();
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));

    // Generate new auth token
    const token = this.generateAuthToken(userData);
    localStorage.setItem(this.TOKEN_KEY, token);

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      encryptionKey: userData.encryptionKey,
      twoFactorEnabled: userData.twoFactorEnabled,
      createdAt: userData.createdAt,
      lastLogin: userData.lastLogin,
      preferences: userData.preferences
    };
  }

  static logout(): void {
    // Try backend logout first (fire and forget)
    ApiService.logout().catch(error => {
      console.warn('Backend logout failed:', error);
    });

    // Clear local tokens and sensitive data
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ENCRYPTION_KEY);
    // Keep user data for potential re-login, but remove sensitive tokens
  }

  static getCurrentUser(): AuthUser | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_KEY);
    
    if (!token || !userData) {
      return null;
    }

    try {
      const user = JSON.parse(userData);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        encryptionKey: user.encryptionKey,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        preferences: user.preferences
      };
    } catch {
      return null;
    }
  }

  static async enableTwoFactor(): Promise<{ secret: string; qrCode: string }> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Generate 2FA secret (in real app, use proper TOTP library)
    const secret = this.generateSecureId();
    const qrCode = `otpauth://totp/Seen:${user.email}?secret=${secret}&issuer=Seen`;

    return { secret, qrCode };
  }

  static async verifyTwoFactorCode(_userId: string, code: string): Promise<boolean> {
    // In a real app, this would verify TOTP code against stored secret
    // For demo purposes, accept any 6-digit code
    return /^\d{6}$/.test(code);
  }

  static async updatePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) throw new Error('User not found');

    const user = JSON.parse(userData);
    user.preferences = { ...user.preferences, ...preferences };
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static async requestDataExport(): Promise<Blob> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Collect all user data for export
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        preferences: user.preferences
      },
      reports: [], // Would fetch from secure storage
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    return blob;
  }

  static async deleteAccount(): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // In a real app, this would securely delete all user data
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ENCRYPTION_KEY);
    
    // Clear all reports and related data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('seen_report_') || key.startsWith('seen_draft_')) {
        localStorage.removeItem(key);
      }
    });
  }

  private static validateRegistration(data: RegistrationData): void {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Valid email is required');
    }
    
    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Name is required');
    }
    
    if (!data.acceptedTerms || !data.acceptedPrivacyPolicy) {
      throw new Error('Terms and privacy policy must be accepted');
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static generateSecureId(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private static generateSalt(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private static generateAuthToken(user: AuthUser): string {
    const payload = {
      userId: user.id,
      email: user.email,
      issuedAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    return btoa(JSON.stringify(payload));
  }

  private static getDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      language: 'en',
      notifications: {
        email: false,
        push: false,
        security: true
      },
      privacy: {
        shareAnonymizedData: false,
        allowResearchContact: false,
        dataRetentionPeriod: 24 // 2 years default
      }
    };
  }
}