interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200
                    ${isCompleted
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : isActive
                        ? 'bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`
                      text-sm font-medium
                      ${isActive
                        ? 'text-black dark:text-white font-semibold'
                        : isCompleted
                          ? 'text-black dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    `}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-24">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 transition-colors duration-200
                    ${isCompleted
                      ? 'bg-black dark:bg-white'
                      : 'bg-gray-200 dark:bg-gray-800'
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Made with Bob
