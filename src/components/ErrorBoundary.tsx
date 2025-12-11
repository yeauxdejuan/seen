import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // In a real app, you would send this to an error reporting service
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Mock error reporting - in production, send to service like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.log('Error report:', errorReport);
    
    // Store locally for debugging
    const existingReports = JSON.parse(localStorage.getItem('seen_error_reports') || '[]');
    existingReports.push(errorReport);
    localStorage.setItem('seen_error_reports', JSON.stringify(existingReports.slice(-10))); // Keep last 10
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" padding="lg">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We're sorry, but something unexpected happened. Your data is safe and has been preserved.
              </p>

              <div className="space-y-3 mb-6">
                <Button onClick={this.handleRetry} className="w-full">
                  Try Again
                </Button>
                
                <Button onClick={this.handleReload} variant="secondary" className="w-full">
                  Reload Page
                </Button>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <details className="text-left bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-4">
                  <summary className="cursor-pointer font-medium text-gray-900 dark:text-white mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Your privacy is protected:</strong> No personal data was sent in this error report. 
                  Only technical information needed for debugging was collected.
                </p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for graceful error handling in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = () => setError(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Handled error:', error);
    setError(error);
    
    // Report error similar to ErrorBoundary
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const existingReports = JSON.parse(localStorage.getItem('seen_error_reports') || '[]');
    existingReports.push(errorReport);
    localStorage.setItem('seen_error_reports', JSON.stringify(existingReports.slice(-10)));
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
}

// Network error handler
export function useNetworkErrorHandler() {
  // const { handleError } = useErrorHandler(); // Removed unused variable

  const handleNetworkError = React.useCallback(async (operation: () => Promise<any>) => {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      } else if (error instanceof Error && error.message.includes('timeout')) {
        // Timeout error
        throw new Error('The request timed out. Please try again.');
      } else {
        // Other errors
        throw error;
      }
    }
  }, []);

  return { handleNetworkError };
}

// Async error boundary for handling promise rejections
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Prevent the default browser behavior
      event.preventDefault();
      
      // Report the error
      const errorReport = {
        type: 'unhandledRejection',
        reason: event.reason?.toString() || 'Unknown error',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      const existingReports = JSON.parse(localStorage.getItem('seen_error_reports') || '[]');
      existingReports.push(errorReport);
      localStorage.setItem('seen_error_reports', JSON.stringify(existingReports.slice(-10)));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}