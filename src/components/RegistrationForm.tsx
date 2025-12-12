import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { RegistrationData } from '../services/auth';

interface RegistrationFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegistrationForm({ onSuccess, onSwitchToLogin }: RegistrationFormProps) {
  const { register, error } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    name: '',
    acceptedTerms: false,
    acceptedPrivacyPolicy: false
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate passwords match
    if (formData.password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    // Validate terms acceptance
    if (!formData.acceptedTerms || !formData.acceptedPrivacyPolicy) {
      setLocalError('You must accept the terms and privacy policy to continue');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      showToast({
        message: 'Account created successfully! Welcome to Seen.',
        type: 'success'
      });
      onSuccess?.();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<RegistrationData>) => {
    setFormData((prev: RegistrationData) => ({ ...prev, ...updates }));
  };

  const displayError = localError || error;

  return (
    <Card padding="lg" className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create Your Account
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Join Seen to document and share your experiences securely
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
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className="input-field"
            placeholder="Enter your full name"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
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
            value={formData.password}
            onChange={(e) => updateFormData({ password: e.target.value })}
            className="input-field"
            placeholder="Create a strong password"
            minLength={8}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Must be at least 8 characters long
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            placeholder="Confirm your password"
            minLength={8}
            required
            disabled={isLoading}
          />
        </div>

        {/* Terms and Privacy */}
        <div className="space-y-3">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptedTerms}
              onChange={(e) => updateFormData({ acceptedTerms: e.target.checked })}
              className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              required
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              I accept the{' '}
              <a href="/terms" className="text-black dark:text-white hover:underline">
                Terms of Service
              </a>
            </span>
          </label>

          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptedPrivacyPolicy}
              onChange={(e) => updateFormData({ acceptedPrivacyPolicy: e.target.checked })}
              className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              required
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              I accept the{' '}
              <a href="/privacy" className="text-black dark:text-white hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-black dark:text-white hover:underline font-medium"
          >
            Sign In
          </button>
        </p>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
        <div className="flex items-start">
          <svg className="w-4 h-4 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-xs text-green-800 dark:text-green-200 font-medium mb-1">
              Secure Account Creation
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              Accounts are created on our secure backend when available, or stored locally with encryption for demo purposes.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}