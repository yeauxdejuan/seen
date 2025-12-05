// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email?: string;
}

// Demographics Types
export interface Demographics {
  race?: string[];
  ageRange?: string;
  genderIdentity?: string;
  keepPrivate?: boolean;
}

// Incident Types
export type IncidentType = 
  | 'workplace-bias'
  | 'police-encounter'
  | 'housing-discrimination'
  | 'education'
  | 'public-space'
  | 'online'
  | 'other';

export interface Location {
  city: string;
  state: string;
  country: string;
}

export interface IncidentTiming {
  date: string;
  timeLabel: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface Impact {
  description: string;
  reportedTo?: string;
  reportedToDetails?: string;
  supportDesired: string[];
}

// Main Incident Report Types
export interface IncidentReportDraft {
  // Step 1: Context
  demographics?: Demographics;
  
  // Step 2: Incident Details
  incidentTypes: IncidentType[];
  title: string;
  narrative: string;
  tags: string[];
  
  // Step 3: Location & Timing
  location: Location;
  timing: IncidentTiming;
  
  // Step 4: Impact & Follow-up
  impact: Impact;
  contactEmail?: string;
  openToContact?: boolean;
}

export interface IncidentReport extends IncidentReportDraft {
  id: string;
  createdAt: string;
  userId?: string;
}

// Analytics Types
export interface IncidentTypeCount {
  type: IncidentType;
  count: number;
  label: string;
}

export interface IncidentTimeSeries {
  month: string;
  count: number;
}

export interface LocationCount {
  location: string;
  count: number;
}

export interface IncidentAggregates {
  totalReports: number;
  byType: IncidentTypeCount[];
  overTime: IncidentTimeSeries[];
  byLocation: LocationCount[];
}

// Filter Types
export interface AnalyticsFilters {
  incidentTypes: IncidentType[];
  dateRange: {
    start: string;
    end: string;
  };
  locations: string[];
}

// Support Options
export const SUPPORT_OPTIONS = [
  'Legal help',
  'Mental health support',
  'Community advocacy',
  'Just to be heard',
  'Financial assistance',
  'Educational resources',
] as const;

export type SupportOption = typeof SUPPORT_OPTIONS[number];

// Incident Type Labels
export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  'workplace-bias': 'Workplace Bias',
  'police-encounter': 'Police Encounter',
  'housing-discrimination': 'Housing Discrimination',
  'education': 'Education',
  'public-space': 'Public Space',
  'online': 'Online',
  'other': 'Other',
};

// Age Range Options
export const AGE_RANGES = [
  'Under 18',
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+',
  'Prefer not to say',
] as const;

// Gender Identity Options
export const GENDER_IDENTITIES = [
  'Male',
  'Female',
  'Non-binary',
  'Transgender',
  'Prefer to self-describe',
  'Prefer not to say',
] as const;

// Race/Ethnicity Options
export const RACE_ETHNICITY_OPTIONS = [
  'Black or African American',
  'Hispanic or Latino',
  'Asian',
  'Native American or Alaska Native',
  'Native Hawaiian or Pacific Islander',
  'White',
  'Middle Eastern or North African',
  'Multiracial',
  'Prefer to self-describe',
  'Prefer not to say',
] as const;

// Made with Bob
