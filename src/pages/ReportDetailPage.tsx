/**
 * Enhanced Report Detail Page
 * Comprehensive view of a single report with timeline, support resources,
 * file attachments, and follow-up capabilities
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ReportTimeline } from '../components/ReportTimeline';
import { SupportResources } from '../components/SupportResources';
import { FileUpload } from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import type { IncidentReport } from '../types';
import { INCIDENT_TYPE_LABELS } from '../types';

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

export function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'support' | 'files'>('overview');
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  useEffect(() => {
    if (reportId) {
      loadReport(reportId);
      loadTimelineEvents(reportId);
    }
  }, [reportId]);

  const loadReport = async (id: string) => {
    try {
      setLoading(true);
      // In a real app, this would call ApiService.getReport(id)
      // For now, we'll simulate loading from localStorage
      const reports = JSON.parse(localStorage.getItem('seen_reports') || '[]');
      const foundReport = reports.find((r: IncidentReport) => r.id === id);
      
      if (foundReport) {
        setReport(foundReport);
      } else {
        navigate('/my-reports');
      }
    } catch (error) {
      console.error('Error loading report:', error);
      navigate('/my-reports');
    } finally {
      setLoading(false);
    }
  };

  const loadTimelineEvents = async (_id: string) => {
    try {
      // In a real app, this would call ApiService.getReportTimeline(id)
      // For now, we'll create mock timeline events
      const mockEvents: TimelineEvent[] = [
        {
          id: '1',
          type: 'created',
          title: 'Report Created',
          description: 'Initial incident report submitted',
          timestamp: new Date().toISOString(),
          actor: {
            name: 'You',
            role: 'user'
          }
        },
        {
          id: '2',
          type: 'system',
          title: 'Report Processed',
          description: 'Report has been encrypted and stored securely',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          actor: {
            name: 'System',
            role: 'system'
          }
        }
      ];
      
      setTimelineEvents(mockEvents);
    } catch (error) {
      console.error('Error loading timeline:', error);
    }
  };

  const handleAddTimelineEvent = (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setTimelineEvents(prev => [newEvent, ...prev]);
    
    // In a real app, this would call ApiService.addTimelineEvent
    console.log('Adding timeline event:', newEvent);
  };

  const handleFilesUploaded = (files: any[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Add timeline event for file upload
    handleAddTimelineEvent({
      type: 'updated',
      title: 'Files Attached',
      description: `Added ${files.length} file(s) to the report`,
      actor: {
        name: 'You',
        role: 'user'
      },
      metadata: {
        attachments: files.map(f => f.name)
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Card padding="lg">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Report Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The report you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/my-reports')}>
              Back to My Reports
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'support', label: 'Support', icon: '🤝' },
    { id: 'files', label: 'Files', icon: '📎' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/my-reports')}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Reports</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Chip className={getStatusColor('pending')}>
                Pending Review
              </Chip>
              <Button variant="secondary" size="sm">
                Edit Report
              </Button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {report.title}
          </h1>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Report ID: {report.id}</span>
            <span>•</span>
            <span>Created: {formatDate(report.createdAt)}</span>
            <span>•</span>
            <span>Last Updated: {formatDate(report.createdAt)}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-black dark:border-white text-black dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Incident Details */}
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Incident Details
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type of Incident
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {report.incidentTypes.map(type => (
                          <Chip key={type} variant="primary">
                            {INCIDENT_TYPE_LABELS[type]}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {report.narrative}
                      </p>
                    </div>
                    
                    {report.tags && report.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {report.tags.map(tag => (
                            <Chip key={tag} size="sm">
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Location & Timing */}
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Location & Timing
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {report.location.city}, {report.location.state}, {report.location.country}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date & Time
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(report.timing.date).toLocaleDateString()} ({report.timing.timeLabel})
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Impact */}
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Impact & Support Needed
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Impact Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {report.impact.description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Support Desired
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {report.impact.supportDesired.map(support => (
                          <Chip key={support} variant="secondary">
                            {support}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    
                    {report.impact.reportedTo && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Previously Reported
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {report.impact.reportedTo === 'yes' ? 'Yes' : 'No'}
                        </p>
                        {report.impact.reportedToDetails && (
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {report.impact.reportedToDetails}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button className="w-full" onClick={() => setActiveTab('support')}>
                      Find Support Resources
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={() => setActiveTab('timeline')}>
                      Add Update
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setActiveTab('files')}>
                      Attach Files
                    </Button>
                  </div>
                </Card>

                {/* Report Statistics */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Report Statistics
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Views:</span>
                      <span className="text-gray-900 dark:text-white">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Updates:</span>
                      <span className="text-gray-900 dark:text-white">{timelineEvents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Files:</span>
                      <span className="text-gray-900 dark:text-white">{uploadedFiles.length}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <ReportTimeline
              reportId={report.id}
              events={timelineEvents}
              canAddEvents={true}
              onAddEvent={handleAddTimelineEvent}
            />
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <SupportResources
              userLocation={`${report.location.city}, ${report.location.state}`}
              incidentTypes={report.incidentTypes}
              urgency="medium"
              onResourceContact={(resource, method) => {
                console.log('Resource contacted:', resource.name, method);
                handleAddTimelineEvent({
                  type: 'support',
                  title: 'Support Resource Contacted',
                  description: `Contacted ${resource.name} via ${method}`,
                  actor: {
                    name: 'You',
                    role: 'user'
                  },
                  metadata: {
                    tags: [resource.type, method]
                  }
                });
              }}
            />
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="space-y-6">
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  File Attachments
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Upload supporting documents, photos, or other evidence related to this incident.
                  All files are automatically encrypted and metadata is scrubbed for privacy.
                </p>
                
                <FileUpload
                  onFilesUploaded={handleFilesUploaded}
                  reportId={report.id}
                  maxFiles={10}
                  maxFileSize={25}
                />
              </Card>

              {uploadedFiles.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-3">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}