import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '../components/Stepper';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import type { 
  IncidentReportDraft, 
  IncidentType,
  Demographics,
  Location,
  IncidentTiming,
  Impact
} from '../types';
import { 
  INCIDENT_TYPE_LABELS,
  AGE_RANGES,
  GENDER_IDENTITIES,
  RACE_ETHNICITY_OPTIONS,
  SUPPORT_OPTIONS
} from '../types';
import { saveReport } from '../services/mockReports';

const STEPS = [
  { id: 'context', title: 'Context', description: 'About you' },
  { id: 'details', title: 'Details', description: 'What happened' },
  { id: 'location', title: 'Location', description: 'Where & when' },
  { id: 'impact', title: 'Impact', description: 'Effects & support' },
  { id: 'review', title: 'Review', description: 'Confirm & submit' },
];

export function ReportWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<IncidentReportDraft>>({
    demographics: {
      race: [],
      keepPrivate: false,
    },
    incidentTypes: [],
    title: '',
    narrative: '',
    tags: [],
    location: {
      city: '',
      state: '',
      country: 'United States',
    },
    timing: {
      date: '',
      timeLabel: 'afternoon',
    },
    impact: {
      description: '',
      supportDesired: [],
    },
    openToContact: false,
  });

  const [tagInput, setTagInput] = useState('');

  const updateFormData = (updates: Partial<IncidentReportDraft>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateDemographics = (updates: Partial<Demographics>) => {
    setFormData(prev => ({
      ...prev,
      demographics: { ...prev.demographics, ...updates },
    }));
  };

  const updateLocation = (updates: Partial<Location>) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, ...updates } as Location,
    }));
  };

  const updateTiming = (updates: Partial<IncidentTiming>) => {
    setFormData(prev => ({
      ...prev,
      timing: { ...prev.timing, ...updates } as IncidentTiming,
    }));
  };

  const updateImpact = (updates: Partial<Impact>) => {
    setFormData(prev => ({
      ...prev,
      impact: { ...prev.impact, ...updates } as Impact,
    }));
  };

  const toggleIncidentType = (type: IncidentType) => {
    const types = formData.incidentTypes || [];
    if (types.includes(type)) {
      updateFormData({ incidentTypes: types.filter(t => t !== type) });
    } else {
      updateFormData({ incidentTypes: [...types, type] });
    }
  };

  const toggleRace = (race: string) => {
    const races = formData.demographics?.race || [];
    if (races.includes(race)) {
      updateDemographics({ race: races.filter(r => r !== race) });
    } else {
      updateDemographics({ race: [...races, race] });
    }
  };

  const toggleSupport = (support: string) => {
    const supports = formData.impact?.supportDesired || [];
    if (supports.includes(support)) {
      updateImpact({ supportDesired: supports.filter(s => s !== support) });
    } else {
      updateImpact({ supportDesired: [...supports, support] });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !(formData.tags || []).includes(tagInput.trim())) {
      updateFormData({ tags: [...(formData.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    updateFormData({ tags: (formData.tags || []).filter(t => t !== tag) });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // All fields optional
      case 2:
        return (formData.incidentTypes?.length || 0) > 0 && 
               formData.title && 
               formData.narrative;
      case 3:
        return formData.location?.city && 
               formData.location?.state && 
               formData.timing?.date;
      case 4:
        return formData.impact?.description && 
               (formData.impact?.supportDesired?.length || 0) > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await saveReport(formData as IncidentReportDraft);
      // Navigate to success page or my reports
      navigate('/my-reports', { 
        state: { message: 'Report submitted successfully!' } 
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('There was an error submitting your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Document Your Experience
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You're in control of what you share. All fields marked as optional can be skipped.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Form Content */}
        <Card padding="lg">
          {/* Step 1: Context */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  About You (Optional)
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Demographic information helps us understand patterns, but all fields are optional. 
                  You can choose to keep this information private.
                </p>
              </div>

              {/* Keep Private Toggle */}
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.demographics?.keepPrivate || false}
                    onChange={(e) => updateDemographics({ keepPrivate: e.target.checked })}
                    className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      Keep personally identifying details private
                    </span>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Your demographic information will not be included in aggregated data
                    </p>
                  </div>
                </label>
              </div>

              {/* Race/Ethnicity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Race/Ethnicity (Optional, select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {RACE_ETHNICITY_OPTIONS.map((race) => (
                    <button
                      key={race}
                      type="button"
                      onClick={() => toggleRace(race)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                        ${(formData.demographics?.race || []).includes(race)
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      {race}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age Range (Optional)
                </label>
                <select
                  value={formData.demographics?.ageRange || ''}
                  onChange={(e) => updateDemographics({ ageRange: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select age range</option>
                  {AGE_RANGES.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              {/* Gender Identity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender Identity (Optional)
                </label>
                <select
                  value={formData.demographics?.genderIdentity || ''}
                  onChange={(e) => updateDemographics({ genderIdentity: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select gender identity</option>
                  {GENDER_IDENTITIES.map((gender) => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Incident Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  What Happened
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Share the details of your experience. Take your time and include what feels important to you.
                </p>
              </div>

              {/* Incident Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type of Incident <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Select all that apply
                </p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleIncidentType(type)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                        ${(formData.incidentTypes || []).includes(type)
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      {INCIDENT_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brief Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="e.g., Denied service at restaurant"
                  className="input-field"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(formData.title || '').length}/100 characters
                </p>
              </div>

              {/* Narrative */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What Happened <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Describe the incident in your own words. Include as much or as little detail as you're comfortable sharing.
                </p>
                <textarea
                  value={formData.narrative || ''}
                  onChange={(e) => updateFormData({ narrative: e.target.value })}
                  placeholder="Share your experience..."
                  rows={8}
                  className="input-field resize-none"
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(formData.narrative || '').length}/5000 characters
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (Optional)
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Add keywords to help categorize this incident
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="e.g., profiling, retaliation"
                    className="input-field flex-1"
                  />
                  <Button type="button" onClick={addTag} variant="secondary">
                    Add
                  </Button>
                </div>
                {(formData.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(formData.tags || []).map((tag) => (
                      <Chip key={tag} removable onRemove={() => removeTag(tag)}>
                        {tag}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Location & Timing */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Where and When
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Help us understand the context of when and where this occurred.
                </p>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location?.city || ''}
                    onChange={(e) => updateLocation({ city: e.target.value })}
                    placeholder="e.g., Chicago"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State/Region <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location?.state || ''}
                    onChange={(e) => updateLocation({ state: e.target.value })}
                    placeholder="e.g., Illinois"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.location?.country || 'United States'}
                  onChange={(e) => updateLocation({ country: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Incident <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.timing?.date || ''}
                  onChange={(e) => updateTiming({ date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>

              {/* Time of Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Approximate Time of Day
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['morning', 'afternoon', 'evening', 'night'] as const).map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => updateTiming({ timeLabel: time })}
                      className={`
                        px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 capitalize
                        ${formData.timing?.timeLabel === time
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-8 text-center border-2 border-gray-200 dark:border-gray-800">
                <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                  Map Visualization
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Location visualization coming in future version
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Impact & Follow-up */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Impact and Support
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Help us understand how this affected you and what support would be helpful.
                </p>
              </div>

              {/* Impact Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How did this impact you? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.impact?.description || ''}
                  onChange={(e) => updateImpact({ description: e.target.value })}
                  placeholder="Describe the emotional, professional, financial, or other impacts..."
                  rows={5}
                  className="input-field resize-none"
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(formData.impact?.description || '').length}/2000 characters
                </p>
              </div>

              {/* Reported To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Did you report this to anyone?
                </label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reportedTo"
                      value="yes"
                      checked={formData.impact?.reportedTo === 'yes'}
                      onChange={(e) => updateImpact({ reportedTo: e.target.value })}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reportedTo"
                      value="no"
                      checked={formData.impact?.reportedTo === 'no'}
                      onChange={(e) => updateImpact({ reportedTo: e.target.value })}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">No</span>
                  </label>
                </div>
                {formData.impact?.reportedTo === 'yes' && (
                  <textarea
                    value={formData.impact?.reportedToDetails || ''}
                    onChange={(e) => updateImpact({ reportedToDetails: e.target.value })}
                    placeholder="Who did you report to and what was the outcome?"
                    rows={3}
                    className="input-field resize-none"
                  />
                )}
              </div>

              {/* Support Desired */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What support would you have wanted? <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Select all that apply
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUPPORT_OPTIONS.map((support) => (
                    <button
                      key={support}
                      type="button"
                      onClick={() => toggleSupport(support)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                        ${(formData.impact?.supportDesired || []).includes(support)
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      {support}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Consent */}
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.openToContact || false}
                    onChange={(e) => updateFormData({ openToContact: e.target.checked })}
                    className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      I'm open to being contacted in the future (conceptual only)
                    </span>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      In a production version, this would allow advocates or support organizations to reach out
                    </p>
                  </div>
                </label>
                {formData.openToContact && (
                  <input
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                    placeholder="your.email@example.com"
                    className="input-field mt-3"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Review Your Report
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Please review your information before submitting. You can go back to edit any section.
                </p>
              </div>

              {/* Context Summary */}
              {formData.demographics && (
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Context</h3>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-black dark:text-white hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  {formData.demographics.keepPrivate ? (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Demographic information marked as private
                    </p>
                  ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {formData.demographics.race && formData.demographics.race.length > 0 && (
                        <p>Race/Ethnicity: {formData.demographics.race.join(', ')}</p>
                      )}
                      {formData.demographics.ageRange && (
                        <p>Age Range: {formData.demographics.ageRange}</p>
                      )}
                      {formData.demographics.genderIdentity && (
                        <p>Gender Identity: {formData.demographics.genderIdentity}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Incident Details Summary */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Incident Details</h3>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-sm text-black dark:text-white hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(formData.incidentTypes || []).map((type) => (
                        <Chip key={type} variant="primary" size="sm">
                          {INCIDENT_TYPE_LABELS[type]}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Title:</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{formData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description:</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                      {formData.narrative}
                    </p>
                  </div>
                  {(formData.tags || []).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(formData.tags || []).map((tag) => (
                          <Chip key={tag} size="sm">{tag}</Chip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location & Timing Summary */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Location & Timing</h3>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-sm text-black dark:text-white hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>
                    Location: {formData.location?.city}, {formData.location?.state}, {formData.location?.country}
                  </p>
                  <p>Date: {formData.timing?.date}</p>
                  <p className="capitalize">Time: {formData.timing?.timeLabel}</p>
                </div>
              </div>

              {/* Impact Summary */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Impact & Support</h3>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="text-sm text-black dark:text-white hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Impact:</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                      {formData.impact?.description}
                    </p>
                  </div>
                  {formData.impact?.reportedTo && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reported: {formData.impact.reportedTo === 'yes' ? 'Yes' : 'No'}
                      </p>
                      {formData.impact.reportedToDetails && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {formData.impact.reportedToDetails}
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Support Desired:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(formData.impact?.supportDesired || []).map((support) => (
                        <Chip key={support} variant="secondary" size="sm">
                          {support}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  {formData.openToContact && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Open to contact: Yes
                      </p>
                      {formData.contactEmail && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {formData.contactEmail}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submission Notice */}
              <div className="bg-gray-100 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-black dark:text-white mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white mb-1">
                      Prototype Notice
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      This is a demonstration application. Your data will be stored locally in your browser 
                      and not transmitted to any servers. In a production version, this would implement 
                      robust security and privacy protections.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            
            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Made with Bob
