// Enhanced authentication service with 2FA support
import { EncryptionService } from './encryption';

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

export class AuthService {
  private static readonly TOKEN_KEY = 'seen_auth_token';
  private static readonly USER_KEY = 'seen_user_data';
  private static readonly ENCRYPTION_KEY = 'seen_encryption_key';

  static async register(data: RegistrationData): Promise<AuthUser> {
    // Validate registration data
    this.validateRegistration(data);

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

    // In a real app, this would be sent to a secure backend
    const userData = {
      ...user,
      passwordHash: hashedPassword,
      salt,
      termsAcceptedAt: new Date().toISOString(),
      privacyPolicyAcceptedAt: new Date().toISOString()
    };

    // Store encrypted user data
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    localStorage.setItem(this.ENCRYPTION_KEY, encryptionKey);
    
    // Generate and store auth token
    const token = this.generateAuthToken(user);
    localStorage.setItem(this.TOKEN_KEY, token);

    return user;
  }

  static async login(credentials: LoginCredentials): Promise<AuthUser> {
    const storedUserData = localStorage.getItem(this.USER_KEY);
    if (!storedUserData) {
      throw new Error('User not found');
    }

    const userData = JSON.parse(storedUserData);
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