import { useState, useEffect } from 'react';
import { ApiService } from '../services/api';

export interface BackendStatus {
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({
    isConnected: false,
    isChecking: true,
    lastChecked: null,
    error: null
  });

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, isChecking: true, error: null }));
    
    try {
      await ApiService.healthCheck();
      setStatus({
        isConnected: true,
        isChecking: false,
        lastChecked: new Date(),
        error: null
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        isChecking: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { ...status, checkConnection };
}