import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export function SettingsPage() {
  const { user, updatePreferences, enableTwoFactor, requestDataExport, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'security' | 'data'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string; qrCode: string } | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Card padding="lg">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access settings.</p>
        </Card>
      </div>
    );
  }

  const handleUpdatePreferences = async (updates: any) => {
    try {
      setIsLoading(true);
      await updatePreferences(updates);
      setMessage({ type: 'success', text: 'Preferences updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableTwoFactor = async () => {
    try {
      setIsLoading(true);
      const setup = await enableTwoFactor();
      setTwoFactorSetup(setup);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to enable two-factor authentication' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    try {
      setIsLoading(true);
      const blob = await requestDataExport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seen-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Data exported successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      await deleteAccount();
      setMessage({ type: 'success', text: 'Account deleted successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete account' });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'data', label: 'Data', icon: '📊' },
  ] as const;

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences, privacy, and security settings
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card padding="sm">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card padding="lg">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Profile Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        className="input-field"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email || ''}
                        className="input-field"
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={user.preferences.language}
                      onChange={(e) => handleUpdatePreferences({ language: e.target.value })}
                      className="input-field"
                      disabled={isLoading}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={user.preferences.notifications.email}
                          onChange={(e) => handleUpdatePreferences({
                            notifications: { ...user.preferences.notifications, email: e.target.checked }
                          })}
                          className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          disabled={isLoading}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Email notifications
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={user.preferences.notifications.security}
                          onChange={(e) => handleUpdatePreferences({
                            notifications: { ...user.preferences.notifications, security: e.target.checked }
                          })}
                          className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          disabled={isLoading}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Security alerts
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Privacy Settings
                  </h2>

                  <div className="space-y-4">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={user.preferences.privacy.shareAnonymizedData}
                        onChange={(e) => handleUpdatePreferences({
                          privacy: { ...user.preferences.privacy, shareAnonymizedData: e.target.checked }
                        })}
                        className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        disabled={isLoading}
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Share anonymized data for research
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Help improve understanding of discrimination patterns through anonymized data sharing
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={user.preferences.privacy.allowResearchContact}
                        onChange={(e) => handleUpdatePreferences({
                          privacy: { ...user.preferences.privacy, allowResearchContact: e.target.checked }
                        })}
                        className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        disabled={isLoading}
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Allow contact for research participation
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Researchers may contact you about participating in studies (you can always decline)
                        </p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data Retention Period
                    </label>
                    <select
                      value={user.preferences.privacy.dataRetentionPeriod}
                      onChange={(e) => handleUpdatePreferences({
                        privacy: { ...user.preferences.privacy, dataRetentionPeriod: parseInt(e.target.value) }
                      })}
                      className="input-field"
                      disabled={isLoading}
                    >
                      <option value={12}>1 year</option>
                      <option value={24}>2 years</option>
                      <option value={60}>5 years</option>
                      <option value={-1}>Indefinite</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      How long to keep your data before automatic deletion
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Security Settings
                  </h2>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.twoFactorEnabled
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                        }`}>
                          {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    
                    {!user.twoFactorEnabled && (
                      <Button
                        onClick={handleEnableTwoFactor}
                        disabled={isLoading}
                        size="sm"
                      >
                        Enable 2FA
                      </Button>
                    )}

                    {twoFactorSetup && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          Set up your authenticator app
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                          Scan this QR code with your authenticator app:
                        </p>
                        <div className="bg-white p-4 rounded-lg inline-block">
                          <code className="text-xs break-all">{twoFactorSetup.qrCode}</code>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                          Secret key: <code>{twoFactorSetup.secret}</code>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Account Activity
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Account created: {new Date(user.createdAt).toLocaleDateString()}</p>
                      <p>Last login: {new Date(user.lastLogin).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Data Management
                  </h2>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Export Your Data
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Download a copy of all your data in JSON format
                    </p>
                    <Button
                      onClick={handleDataExport}
                      disabled={isLoading}
                      variant="secondary"
                    >
                      Export Data
                    </Button>
                  </div>

                  <div className="border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                      Delete Account
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    
                    {!showDeleteConfirm ? (
                      <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="secondary"
                        className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900"
                      >
                        Delete Account
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          Are you sure? This will permanently delete all your data.
                        </p>
                        <div className="flex space-x-3">
                          <Button
                            onClick={handleDeleteAccount}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Yes, Delete Account
                          </Button>
                          <Button
                            onClick={() => setShowDeleteConfirm(false)}
                            variant="secondary"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}