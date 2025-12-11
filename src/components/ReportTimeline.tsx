/**
 * Report Timeline Component
 * Tracks the lifecycle of a report including follow-ups,
 * updates, and resolution status
 */

import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Chip } from './Chip';

interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'follow-up' | 'resolution' | 'support' | 'legal' | 'system';
  title: string;
  description: string;
  timestamp: string;
  actor?: {
    name: string;
    role: 'user' | 'advocate' | 'legal' | 'system' | 'support';
  };
  metadata?: {
    status?: string;
    priority?: 'low' | 'medium' | 'high';
    attachments?: string[];
    tags?: string[];
  };
  private?: boolean;
}

interface ReportTimelineProps {
  reportId: string;
  events: TimelineEvent[];
  canAddEvents?: boolean;
  onAddEvent?: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
  onEventUpdate?: (eventId: string, updates: Partial<TimelineEvent>) => void;
}

export function ReportTimeline({
  reportId: _reportId,
  events,
  canAddEvents = false,
  onAddEvent,
  onEventUpdate: _onEventUpdate
}: ReportTimelineProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: 'follow-up' as TimelineEvent['type'],
    title: '',
    description: '',
    private: false
  });

  const handleAddEvent = () => {
    if (newEvent.title.trim() && newEvent.description.trim()) {
      onAddEvent?.({
        ...newEvent,
        actor: {
          name: 'You',
          role: 'user'
        }
      });
      
      setNewEvent({
        type: 'follow-up',
        title: '',
        description: '',
        private: false
      });
      setShowAddForm(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'updated':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        );
      case 'follow-up':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
          </svg>
        );
      case 'resolution':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'support':
        return (
          <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        );
      case 'legal':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.94l1-4H9.03z" clipRule="evenodd" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getActorBadge = (role: string) => {
    const badges = {
      user: { label: 'You', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      advocate: { label: 'Advocate', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      legal: { label: 'Legal', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      support: { label: 'Support', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      system: { label: 'System', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
    };
    
    const badge = badges[role as keyof typeof badges] || badges.system;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Report Timeline
        </h3>
        {canAddEvents && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            Add Update
          </Button>
        )}
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <Card>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Add Timeline Update
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Update Type
              </label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as TimelineEvent['type'] }))}
                className="input-field"
              >
                <option value="follow-up">Follow-up</option>
                <option value="updated">Information Update</option>
                <option value="support">Support Received</option>
                <option value="legal">Legal Action</option>
                <option value="resolution">Resolution</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the update"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Details
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide more details about this update..."
                rows={4}
                className="input-field resize-none"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="private-event"
                checked={newEvent.private}
                onChange={(e) => setNewEvent(prev => ({ ...prev, private: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="private-event" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Keep this update private (only visible to you)
              </label>
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={handleAddEvent}>
                Add Update
              </Button>
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        
        <div className="space-y-6">
          {sortedEvents.map((event) => (
            <div key={event.id} className="relative flex items-start space-x-4">
              {/* Timeline dot */}
              <div className="relative flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-full">
                {getEventIcon(event.type)}
              </div>
              
              {/* Event content */}
              <div className="flex-1 min-w-0">
                <Card className={event.private ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        {event.private && (
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        {event.actor && getActorBadge(event.actor.role)}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimestamp(event.timestamp)}
                        </span>
                        {event.metadata?.priority && (
                          <Chip 
                            size="sm" 
                            variant={event.metadata.priority === 'high' ? 'primary' : 'secondary'}
                          >
                            {event.metadata.priority} priority
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {event.description}
                  </p>
                  
                  {event.metadata?.tags && event.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {event.metadata.tags.map(tag => (
                        <Chip key={tag} size="sm">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  )}
                  
                  {event.metadata?.attachments && event.metadata.attachments.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Attachments:
                      </p>
                      <div className="space-y-1">
                        {event.metadata.attachments.map((attachment, i) => (
                          <div key={i} className="flex items-center space-x-2 text-sm">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                            </svg>
                            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                              {attachment}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ))}
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              No timeline events yet. Add your first update to track progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}