import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { LoginCredentials } from '../services/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { login, error } = useAuth();
  const { showToast } = useToast();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    twoFactorCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    try {
      await login(credentials);
      showToast({
        message: 'Successfully signed in!',
        type: 'success'
      });
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      
      if (errorMessage === 'Two-factor authentication required') {
        setShowTwoFactor(true);
      } else {
        setLocalError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <Card padding="lg" className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sign In to Seen
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Access your secure account
        </p>
      </div>

      {displayError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{displayError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials((prev: LoginCredentials) => ({ ...prev, email: e.target.value }))}
            className="input-field"
            placeholder="your.email@example.com"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials((prev: LoginCredentials) => ({ ...prev, password: e.target.value }))}
            className="input-field"
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
        </div>

        {showTwoFactor && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Two-Factor Authentication Code
            </label>
            <input
              type="text"
              value={credentials.twoFactorCode || ''}
              onChange={(e) => setCredentials((prev: LoginCredentials) => ({ ...prev, twoFactorCode: e.target.value }))}
              className="input-field"
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the code from your authenticator app
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-black dark:text-white hover:underline font-medium"
          >
            Create Account
          </button>
        </p>
      </div>

      {/* Demo Notice */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Authentication:</strong> Sign in with your backend account or create a local demo account. 
          Backend accounts sync across devices, while demo accounts are stored locally.
        </p>
      </div>
    </Card>
  );
}