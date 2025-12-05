import type {
  IncidentReport,
  IncidentReportDraft,
  IncidentAggregates,
  IncidentTypeCount,
  IncidentTimeSeries,
  LocationCount
} from '../types';

// Mock delay to simulate API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock ID
const generateId = () => `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Local storage keys
const REPORTS_KEY = 'seen-mock-reports';

// Get reports from localStorage
function getStoredReports(): IncidentReport[] {
  try {
    const stored = localStorage.getItem(REPORTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error parsing stored reports:', error);
    return [];
  }
}

// Save reports to localStorage
function saveStoredReports(reports: IncidentReport[]): void {
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  } catch (error) {
    console.error('Error saving reports:', error);
  }
}

// Mock API functions
export async function saveReport(reportDraft: IncidentReportDraft): Promise<IncidentReport> {
  await delay(800); // Simulate network delay
  
  const report: IncidentReport = {
    ...reportDraft,
    id: generateId(),
    createdAt: new Date().toISOString(),
    userId: 'mock-user-1', // In real app, this would come from auth
  };
  
  const existingReports = getStoredReports();
  const updatedReports = [...existingReports, report];
  saveStoredReports(updatedReports);
  
  return report;
}

export async function getMyReports(): Promise<IncidentReport[]> {
  await delay(400);
  
  const reports = getStoredReports();
  // In real app, filter by userId
  return reports.filter(report => report.userId === 'mock-user-1');
}

export async function getReportById(id: string): Promise<IncidentReport | null> {
  await delay(300);
  
  const reports = getStoredReports();
  return reports.find(report => report.id === id) || null;
}

// Mock aggregated data for analytics
const MOCK_AGGREGATED_DATA: IncidentAggregates = {
  totalReports: 247,
  byType: [
    { type: 'workplace-bias', count: 89, label: 'Workplace Bias' },
    { type: 'police-encounter', count: 45, label: 'Police Encounter' },
    { type: 'housing-discrimination', count: 32, label: 'Housing Discrimination' },
    { type: 'public-space', count: 28, label: 'Public Space' },
    { type: 'education', count: 24, label: 'Education' },
    { type: 'online', count: 19, label: 'Online' },
    { type: 'other', count: 10, label: 'Other' },
  ] as IncidentTypeCount[],
  overTime: [
    { month: '2024-01', count: 15 },
    { month: '2024-02', count: 18 },
    { month: '2024-03', count: 22 },
    { month: '2024-04', count: 19 },
    { month: '2024-05', count: 25 },
    { month: '2024-06', count: 28 },
    { month: '2024-07', count: 31 },
    { month: '2024-08', count: 27 },
    { month: '2024-09', count: 24 },
    { month: '2024-10', count: 21 },
    { month: '2024-11', count: 23 },
    { month: '2024-12', count: 14 },
  ] as IncidentTimeSeries[],
  byLocation: [
    { location: 'New York, NY', count: 45 },
    { location: 'Los Angeles, CA', count: 38 },
    { location: 'Chicago, IL', count: 32 },
    { location: 'Houston, TX', count: 28 },
    { location: 'Phoenix, AZ', count: 24 },
    { location: 'Philadelphia, PA', count: 22 },
    { location: 'San Antonio, TX', count: 18 },
    { location: 'San Diego, CA', count: 16 },
    { location: 'Dallas, TX', count: 14 },
    { location: 'Austin, TX', count: 10 },
  ] as LocationCount[],
};

export async function getAggregatedStats(): Promise<IncidentAggregates> {
  await delay(600);
  
  // In a real app, this would combine stored reports with the mock data
  // For now, we'll just return the mock data with some dynamic elements
  const storedReports = getStoredReports();
  
  return {
    ...MOCK_AGGREGATED_DATA,
    totalReports: MOCK_AGGREGATED_DATA.totalReports + storedReports.length,
  };
}

// Initialize with some sample data if none exists
export function initializeMockData(): void {
  const existingReports = getStoredReports();
  
  if (existingReports.length === 0) {
    // Add a few sample reports for demonstration
    const sampleReports: IncidentReport[] = [
      {
        id: 'sample-1',
        createdAt: '2024-11-15T10:30:00Z',
        userId: 'mock-user-1',
        demographics: {
          race: ['Black or African American'],
          ageRange: '25-34',
          genderIdentity: 'Female',
          keepPrivate: false,
        },
        incidentTypes: ['workplace-bias'],
        title: 'Passed over for promotion despite qualifications',
        narrative: 'Despite having all required qualifications and positive performance reviews, I was passed over for a promotion that went to a less qualified colleague.',
        tags: ['promotion', 'workplace', 'bias'],
        location: {
          city: 'Chicago',
          state: 'Illinois',
          country: 'United States',
        },
        timing: {
          date: '2024-11-10',
          timeLabel: 'afternoon',
        },
        impact: {
          description: 'Felt demoralized and questioned my career path. Financial impact from missed promotion.',
          reportedTo: 'yes',
          reportedToDetails: 'Reported to HR, but no action was taken.',
          supportDesired: ['Legal help', 'Community advocacy'],
        },
        openToContact: false,
      },
      {
        id: 'sample-2',
        createdAt: '2024-11-20T14:15:00Z',
        userId: 'mock-user-1',
        incidentTypes: ['public-space'],
        title: 'Followed and questioned in retail store',
        narrative: 'Was followed by security throughout my shopping trip and questioned about items I was looking at, despite not exhibiting any suspicious behavior.',
        tags: ['retail', 'profiling', 'security'],
        location: {
          city: 'Austin',
          state: 'Texas',
          country: 'United States',
        },
        timing: {
          date: '2024-11-18',
          timeLabel: 'evening',
        },
        impact: {
          description: 'Felt humiliated and unwelcome. Avoided shopping at that location since.',
          supportDesired: ['Just to be heard', 'Community advocacy'],
        },
        openToContact: true,
        contactEmail: 'example@email.com',
      },
    ];
    
    saveStoredReports(sampleReports);
  }
}

// Made with Bob
