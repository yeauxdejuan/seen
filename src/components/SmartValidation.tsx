import { useState, useEffect } from 'react';

interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface SmartValidationProps {
  data: any;
  rules: ValidationRule[];
  onValidationChange: (isValid: boolean, errors: Record<string, string>) => void;
  showErrors?: boolean;
}

export function SmartValidation({ 
  data, 
  rules, 
  onValidationChange, 
  showErrors = false 
}: SmartValidationProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const newErrors: Record<string, string> = {};

    rules.forEach(rule => {
      const value = getNestedValue(data, rule.field);
      const error = validateField(value, rule);
      
      if (error) {
        newErrors[rule.field] = error;
      }
    });

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0, newErrors);
  }, [data, rules, onValidationChange]);

  const validateField = (value: any, rule: ValidationRule): string | null => {
    // Required validation
    if (rule.required && (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value.trim()))) {
      return `${getFieldLabel(rule.field)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${getFieldLabel(rule.field)} must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return `${getFieldLabel(rule.field)} must be no more than ${rule.maxLength} characters`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return `${getFieldLabel(rule.field)} format is invalid`;
      }
    }

    // Array validations
    if (Array.isArray(value) && rule.required && value.length === 0) {
      return `Please select at least one ${getFieldLabel(rule.field).toLowerCase()}`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      'incidentTypes': 'Incident Type',
      'title': 'Title',
      'narrative': 'Description',
      'location.city': 'City',
      'location.state': 'State',
      'timing.date': 'Date',
      'impact.description': 'Impact Description',
      'impact.supportDesired': 'Support Desired',
      'demographics.race': 'Race/Ethnicity',
      'demographics.ageRange': 'Age Range',
      'demographics.genderIdentity': 'Gender Identity'
    };

    return labels[field] || field.split('.').pop()?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) || field;
  };

  // Removed unused markFieldTouched function

  if (!showErrors) return null;

  return (
    <div className="space-y-2">
      {Object.entries(errors).map(([field, error]) => (
        touched[field] && (
          <div key={field} className="flex items-start space-x-2 text-sm text-red-600 dark:text-red-400">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )
      ))}
    </div>
  );
}

// Hook for using smart validation
export function useSmartValidation(_initialData: any, rules: ValidationRule[]) {
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  const handleValidationChange = (valid: boolean, validationErrors: Record<string, string>) => {
    setIsValid(valid);
    setErrors(validationErrors);
  };

  const validateAndShowErrors = () => {
    setShowErrors(true);
    return isValid;
  };

  return {
    isValid,
    errors,
    showErrors,
    setShowErrors,
    handleValidationChange,
    validateAndShowErrors,
    ValidationComponent: ({ data }: { data: any }) => (
      <SmartValidation
        data={data}
        rules={rules}
        onValidationChange={handleValidationChange}
        showErrors={showErrors}
      />
    )
  };
}