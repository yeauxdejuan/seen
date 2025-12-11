import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import type { IncidentReport } from '../types';
import { INCIDENT_TYPE_LABELS } from '../types';
import { getUserReports } from '../services/mockReports';

export function MyReports() {
  const { user, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Show success message if coming from report submission
    if (location.state?.message) {
      setShowSuccessMessage(true);
      // Clear the message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
      // Clear the state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (user) {
      loadReports();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const userReports = await getUserReports();
      setReports(userReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatIncidentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // If user is not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center" padding="lg">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Sign In Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please sign in to view your reports. This is a mock authentication for demonstration purposes.
            </p>
            <Button onClick={signIn}>
              Sign In (Mock)
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your submitted incident reports
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 dark:text-green-200 font-medium">
                {location.state?.message || 'Report submitted successfully!'}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="No reports yet"
            description="You haven't submitted any incident reports. Start by documenting an experience to help build awareness and create positive change."
            actionLabel="Start Your First Report"
            onAction={() => navigate('/report')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports List */}
            <div className="space-y-4">
              {reports.map((report) => (
                <Card
                  key={report.id}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {report.title}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {report.incidentTypes.map((type) => (
                        <Chip key={type} variant="primary" size="sm">
                          {INCIDENT_TYPE_LABELS[type]}
                        </Chip>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <span className="font-medium">Location:</span> {report.location.city}, {report.location.state}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span> {formatIncidentDate(report.timing.date)}
                      </p>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                      {report.narrative}
                    </p>
                    
                    {report.tags && report.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {report.tags.slice(0, 3).map((tag) => (
                          <Chip key={tag} size="sm">
                            {tag}
                          </Chip>
                        ))}
                        {report.tags.length > 3 && (
                          <Chip size="sm">
                            +{report.tags.length - 3} more
                          </Chip>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/report/${report.id}`);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                      >
                        Quick View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Report Detail Panel */}
            <div className="lg:sticky lg:top-8">
              {selectedReport ? (
                <Card padding="lg">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Report Details
                      </h2>
                      <button
                        onClick={() => setSelectedReport(null)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {selectedReport.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedReport.incidentTypes.map((type) => (
                            <Chip key={type} variant="primary" size="sm">
                              {INCIDENT_TYPE_LABELS[type]}
                            </Chip>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                          {selectedReport.narrative}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Location</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {selectedReport.location.city}, {selectedReport.location.state}
                            <br />
                            {selectedReport.location.country}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">When</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {formatIncidentDate(selectedReport.timing.date)}
                            <br />
                            <span className="capitalize">{selectedReport.timing.timeLabel}</span>
                          </p>
                        </div>
                      </div>

                      {selectedReport.tags && selectedReport.tags.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedReport.tags.map((tag) => (
                              <Chip key={tag} size="sm">{tag}</Chip>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Impact</h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                          {selectedReport.impact.description}
                        </p>
                      </div>

                      {selectedReport.impact.reportedTo && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Reported</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {selectedReport.impact.reportedTo === 'yes' ? 'Yes' : 'No'}
                          </p>
                          {selectedReport.impact.reportedToDetails && (
                            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                              {selectedReport.impact.reportedToDetails}
                            </p>
                          )}
                        </div>
                      )}

                      {selectedReport.impact.supportDesired && selectedReport.impact.supportDesired.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Support Desired</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedReport.impact.supportDesired.map((support) => (
                              <Chip key={support} variant="secondary" size="sm">
                                {support}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p>Report ID: {selectedReport.id}</p>
                        <p>Submitted: {formatDate(selectedReport.createdAt)}</p>
                        <p className="mt-2 bg-gray-100 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded p-2">
                          <strong>Note:</strong> This data is stored locally in your browser for this prototype. 
                          In a production version, reports would be securely stored with privacy protections.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card padding="lg" className="text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a Report
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click on a report from the list to view its details
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {reports.length > 0 && (
          <div className="mt-8 text-center">
            <Button onClick={() => navigate('/report')}>
              Submit Another Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
