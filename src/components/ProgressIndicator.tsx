import { useEffect, useState } from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  formData: any;
  estimatedTimePerStep?: number; // minutes
}

export function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  formData, 
  estimatedTimePerStep = 3 
}: ProgressIndicatorProps) {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);

  useEffect(() => {
    // Calculate completion based on step and form completeness
    const stepProgress = (currentStep - 1) / totalSteps;
    const formCompleteness = calculateFormCompleteness(formData);
    const currentStepProgress = formCompleteness / totalSteps;
    
    const totalProgress = Math.min(100, (stepProgress + currentStepProgress) * 100);
    setCompletionPercentage(totalProgress);

    // Estimate time remaining
    const stepsRemaining = totalSteps - currentStep + (1 - formCompleteness);
    setEstimatedTimeRemaining(Math.max(0, stepsRemaining * estimatedTimePerStep));
  }, [currentStep, totalSteps, formData, estimatedTimePerStep]);

  const calculateFormCompleteness = (data: any): number => {
    if (!data) return 0;

    let completedFields = 0;
    let totalFields = 0;

    // Step 1: Demographics (optional, so count as complete if any field filled)
    totalFields += 1;
    if (data.demographics && (
      data.demographics.race?.length > 0 ||
      data.demographics.ageRange ||
      data.demographics.genderIdentity
    )) {
      completedFields += 1;
    }

    // Step 2: Incident details (required fields)
    totalFields += 3;
    if (data.incidentTypes?.length > 0) completedFields += 1;
    if (data.title?.trim()) completedFields += 1;
    if (data.narrative?.trim()) completedFields += 1;

    // Step 3: Location & timing (required fields)
    totalFields += 3;
    if (data.location?.city?.trim()) completedFields += 1;
    if (data.location?.state?.trim()) completedFields += 1;
    if (data.timing?.date) completedFields += 1;

    // Step 4: Impact (required fields)
    totalFields += 2;
    if (data.impact?.description?.trim()) completedFields += 1;
    if (data.impact?.supportDesired?.length > 0) completedFields += 1;

    return totalFields > 0 ? completedFields / totalFields : 0;
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
              <span className="text-white dark:text-black text-sm font-bold">
                {currentStep}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(completionPercentage)}% complete
          </div>
        </div>

        {estimatedTimeRemaining > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ~{Math.ceil(estimatedTimeRemaining)} min remaining
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Auto-save indicator */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Auto-saved</span>
        </div>
        
        <div>
          All data is encrypted and stored securely
        </div>
      </div>
    </div>
  );
}