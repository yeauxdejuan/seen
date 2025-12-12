import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../services/auth';
import type { AuthUser, LoginCredentials, RegistrationData } from '../services/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  signIn: () => void; // Keep for backward compatibility
  signOut: () => void; // Keep for backward compatibility
  logout: () => void;
  updatePreferences: (preferences: any) => Promise<void>;
  enableTwoFactor: () => Promise<{ secret: string; qrCode: string }>;
  requestDataExport: () => Promise<Blob>;
  deleteAccount: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for backward compatibility
const MOCK_USER: AuthUser = {
  id: 'mock-user-1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  encryptionKey: 'mock-key',
  twoFactorEnabled: false,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  preferences: {
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
      dataRetentionPeriod: 24
    }
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing secure session first
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      // Fallback to mock user for backward compatibility
      const savedUser = localStorage.getItem('seen-mock-user');
      if (savedUser) {
        try {
          const mockUser = JSON.parse(savedUser);
          setUser({ ...MOCK_USER, ...mockUser });
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('seen-mock-user');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setIsLoading(true);
      const authenticatedUser = await AuthService.login(credentials);
      setUser(authenticatedUser);
      
      // Show success message (will be handled by the component)
      return { success: true, user: authenticatedUser };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegistrationData) => {
    try {
      setError(null);
      setIsLoading(true);
      const newUser = await AuthService.register(data);
      setUser(newUser);
      
      // Show success message (will be handled by the component)
      return { success: true, user: newUser };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Backward compatibility methods
  const signIn = () => {
    setUser(MOCK_USER);
    localStorage.setItem('seen-mock-user', JSON.stringify(MOCK_USER));
  };

  const signOut = () => {
    logout();
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setError(null);
    localStorage.removeItem('seen-mock-user');
  };

  const updatePreferences = async (preferences: any) => {
    try {
      await AuthService.updatePreferences(preferences);
      const updatedUser = AuthService.getCurrentUser();
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  };

  const enableTwoFactor = async () => {
    try {
      return await AuthService.enableTwoFactor();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable two-factor authentication');
      throw err;
    }
  };

  const requestDataExport = async () => {
    try {
      return await AuthService.requestDataExport();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      await AuthService.deleteAccount();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    signIn,
    signOut,
    logout,
    updatePreferences,
    enableTwoFactor,
    requestDataExport,
    deleteAccount,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Made with Bob
