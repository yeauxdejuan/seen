import { useState, useEffect } from 'react';

// Offline status hook
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger sync when coming back online
        window.dispatchEvent(new CustomEvent('sync-offline-data'));
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

// Offline indicator component
export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOfflineStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
      isOnline 
        ? 'bg-green-500 text-white' 
        : 'bg-yellow-500 text-black'
    }`}>
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Back online - syncing data...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>You're offline - data will sync when reconnected</span>
          </>
        )}
      </div>
    </div>
  );
}

// Offline storage service
export class OfflineStorageService {
  private static readonly OFFLINE_QUEUE_KEY = 'seen_offline_queue';
  private static readonly OFFLINE_DRAFTS_KEY = 'seen_offline_drafts';

  static queueForSync(action: string, data: any) {
    const queue = this.getOfflineQueue();
    const item = {
      id: Date.now().toString(),
      action,
      data,
      timestamp: new Date().toISOString(),
      retries: 0
    };
    
    queue.push(item);
    localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  }

  static getOfflineQueue() {
    const stored = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static clearOfflineQueue() {
    localStorage.removeItem(this.OFFLINE_QUEUE_KEY);
  }

  static async syncOfflineData() {
    const queue = this.getOfflineQueue();
    const successful: string[] = [];
    
    for (const item of queue) {
      try {
        await this.processQueueItem(item);
        successful.push(item.id);
      } catch (error) {
        console.error('Failed to sync item:', item, error);
        item.retries = (item.retries || 0) + 1;
        
        // Remove items that have failed too many times
        if (item.retries > 3) {
          successful.push(item.id);
        }
      }
    }

    // Remove successfully synced items
    const remainingQueue = queue.filter((item: any) => !successful.includes(item.id));
    localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));

    return {
      synced: successful.length,
      remaining: remainingQueue.length
    };
  }

  private static async processQueueItem(item: any) {
    switch (item.action) {
      case 'save_report':
        // In a real app, this would call the API
        console.log('Syncing report:', item.data);
        break;
      case 'update_preferences':
        console.log('Syncing preferences:', item.data);
        break;
      default:
        console.warn('Unknown sync action:', item.action);
    }
  }

  static saveOfflineDraft(draftId: string, data: any) {
    const drafts = this.getOfflineDrafts();
    drafts[draftId] = {
      data,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(this.OFFLINE_DRAFTS_KEY, JSON.stringify(drafts));
  }

  static getOfflineDrafts() {
    const stored = localStorage.getItem(this.OFFLINE_DRAFTS_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  static removeOfflineDraft(draftId: string) {
    const drafts = this.getOfflineDrafts();
    delete drafts[draftId];
    localStorage.setItem(this.OFFLINE_DRAFTS_KEY, JSON.stringify(drafts));
  }
}

// Hook for offline-aware operations
export function useOfflineAware() {
  const { isOnline } = useOfflineStatus();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  useEffect(() => {
    const handleSync = async () => {
      if (isOnline) {
        setSyncStatus('syncing');
        try {
          const result = await OfflineStorageService.syncOfflineData();
          console.log('Sync completed:', result);
          setSyncStatus('idle');
        } catch (error) {
          console.error('Sync failed:', error);
          setSyncStatus('error');
        }
      }
    };

    window.addEventListener('sync-offline-data', handleSync);
    return () => window.removeEventListener('sync-offline-data', handleSync);
  }, [isOnline]);

  const performAction = async (action: string, data: any, onlineCallback: () => Promise<void>) => {
    if (isOnline) {
      try {
        await onlineCallback();
      } catch (error) {
        // If online action fails, queue for later
        OfflineStorageService.queueForSync(action, data);
        throw error;
      }
    } else {
      // Queue for sync when back online
      OfflineStorageService.queueForSync(action, data);
    }
  };

  return {
    isOnline,
    syncStatus,
    performAction
  };
}