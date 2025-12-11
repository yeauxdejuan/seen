import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ReportWizard } from './pages/ReportWizard';
import { MyReports } from './pages/MyReports';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { ExplorePage } from './pages/ExplorePage';
import { AdvancedExplorePage } from './pages/AdvancedExplorePage';
import { ImpactPage } from './pages/ImpactPage';
import { AboutPage } from './pages/AboutPage';
import { SettingsPage } from './pages/SettingsPage';
import { ErrorBoundary, AsyncErrorBoundary } from './components/ErrorBoundary';
import { KeyboardNavigationHelper } from './components/AccessibilityEnhancements';
import { initializeMockData } from './services/mockReports';

function App() {
  useEffect(() => {
    // Initialize mock data on app load
    initializeMockData();
  }, []);

  return (
    <ErrorBoundary>
      <AsyncErrorBoundary>
        <KeyboardNavigationHelper>
          <Router>
            <AuthProvider>
              <ThemeProvider>
                <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/report" element={<ReportWizard />} />
              <Route path="/my-reports" element={<MyReports />} />
              <Route path="/report/:reportId" element={<ReportDetailPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/advanced-analytics" element={<AdvancedExplorePage />} />
              <Route path="/impact" element={<ImpactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
                </Layout>
              </ThemeProvider>
            </AuthProvider>
          </Router>
        </KeyboardNavigationHelper>
      </AsyncErrorBoundary>
    </ErrorBoundary>
  );
}

export default App;

// Made with Bob
