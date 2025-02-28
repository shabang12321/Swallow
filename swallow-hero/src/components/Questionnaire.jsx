import React, { useState, useEffect } from 'react';
import { QUESTIONNAIRE_STEPS, VALIDATION_RULES, ERROR_MESSAGES } from '../config/constants';

const QuestionnaireField = ({ field, value, onChange, error, onFocus, showError }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Determine if this field should show error styling
  const isErrorField = error || (showError && field.required && !value);
  const fieldErrorClass = isErrorField && showError ? 'shake-error' : isErrorField ? 'error-outline' : '';

  switch (field.type) {
    case 'select':
      return (
        <div className="space-y-2">
          <label className={`block text-sm font-medium text-gray-700 ${field.required ? 'mandatory-field-label' : ''}`}>
            {field.label}
          </label>
          <select
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            onFocus={() => onFocus(field.name)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${fieldErrorClass}`}
          >
            <option value="">Select {field.label}</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && showError && field.required && !value && (
            <p className="text-sm text-red-600">{ERROR_MESSAGES.required(field.label)}</p>
          )}
        </div>
      );

    case 'radio-group':
      return (
        <div className="space-y-2">
          <label className={`block text-sm font-medium text-gray-700 ${field.required ? 'mandatory-field-label' : ''}`}>
            {field.label}
          </label>
          <div className={`mt-2 space-x-4 p-2 rounded-md ${isErrorField ? 'error-outline' : ''} ${fieldErrorClass}`}>
            {field.options.map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="radio"
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  onFocus={() => onFocus(field.name)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && showError && field.required && !value && (
            <p className="text-sm text-red-600">{ERROR_MESSAGES.required(field.label)}</p>
          )}
        </div>
      );

    case 'range':
      return (
        <div className="space-y-2">
          <label className={`block text-sm font-medium text-gray-700 ${field.required ? 'mandatory-field-label' : ''}`}>
            {field.label}
          </label>
          <div className="flex items-center space-x-4">
            {showCustomInput ? (
              <input
                type="number"
                value={value || field.defaultValue}
                min={field.min}
                max={field.max}
                onChange={(e) => onChange(field.name, e.target.value)}
                onFocus={() => onFocus(field.name)}
                className={`mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${fieldErrorClass}`}
              />
            ) : (
              <input
                type="range"
                value={value || field.defaultValue}
                min={field.min}
                max={field.max}
                onChange={(e) => onChange(field.name, e.target.value)}
                onFocus={() => onFocus(field.name)}
                className={`w-full ${fieldErrorClass}`}
              />
            )}
            <span className="text-sm text-gray-600">
              {value || field.defaultValue} {field.unit}
            </span>
            {field.allowCustomInput && (
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showCustomInput ? 'Use Slider' : 'Enter Value'}
              </button>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && showError && field.required && !value && (
            <p className="text-sm text-red-600">{ERROR_MESSAGES.required(field.label)}</p>
          )}
        </div>
      );

    case 'text':
      return (
        <div className="space-y-2">
          <label className={`block text-sm font-medium text-gray-700 ${field.required ? 'mandatory-field-label' : ''}`}>
            {field.label}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            onFocus={() => onFocus(field.name)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${fieldErrorClass}`}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && showError && field.required && !value && (
            <p className="text-sm text-red-600">{ERROR_MESSAGES.required(field.label)}</p>
          )}
        </div>
      );

    case 'multiselect':
      return (
        <div className="space-y-2">
          <label className={`block text-sm font-medium text-gray-700 ${field.required ? 'mandatory-field-label' : ''}`}>
            {field.label}
          </label>
          <div className={`mt-2 p-2 border rounded-md ${fieldErrorClass}`}>
            {field.options.map((option) => (
              <label key={option} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      newValue.push(option);
                    } else {
                      const index = newValue.indexOf(option);
                      if (index !== -1) {
                        newValue.splice(index, 1);
                      }
                    }
                    onChange(field.name, newValue);
                  }}
                  onFocus={() => onFocus(field.name)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && showError && field.required && (!value || value.length === 0) && (
            <p className="text-sm text-red-600">{ERROR_MESSAGES.required(field.label)}</p>
          )}
        </div>
      );

    default:
      return null;
  }
};

const QuestionnaireStep = ({ step, formData, onChange, onNext, onBack, isLastStep }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [shakeFields, setShakeFields] = useState(false);

  // Reset showErrors when step changes
  useEffect(() => {
    setShowErrors(false);
    setShakeFields(false);
  }, [step]);

  const validateField = (field, value) => {
    if (field.required) {
      if (!value) {
        return ERROR_MESSAGES.required(field.label);
      }
      
      // For multiselect, check if array is empty
      if (field.type === 'multiselect' && Array.isArray(value) && value.length === 0) {
        return ERROR_MESSAGES.required(field.label);
      }
    }

    const rules = VALIDATION_RULES[field.name];
    if (!rules) return null;

    if (field.type === 'range' || field.name === 'age') {
      const num = Number(value);
      if (num < rules.min || num > rules.max) {
        return ERROR_MESSAGES[`invalid${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`];
      }
    }

    if (field.name === 'phoneNumber' && value) {
      if (!rules.pattern.test(value)) {
        return ERROR_MESSAGES.invalidPhone;
      }
    }

    return null;
  };

  const validateStep = () => {
    const newErrors = {};
    step.fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) newErrors[field.name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const newTouched = {};
    step.fields.forEach(field => {
      newTouched[field.name] = true;
    });
    setTouched(newTouched);

    if (validateStep()) {
      onNext();
    } else {
      // Show errors and trigger shake animation
      setShowErrors(true);
      setShakeFields(true);
      
      // Reset shake animation after it completes
      setTimeout(() => {
        setShakeFields(false);
      }, 600); // Match the duration of the shake animation
    }
  };

  const handleFieldFocus = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">{step.title}</h2>
      <div className="space-y-6">
        {step.fields.map((field) => (
          <QuestionnaireField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={onChange}
            error={touched[field.name] ? errors[field.name] : null}
            onFocus={handleFieldFocus}
            showError={showErrors && shakeFields}
          />
        ))}
      </div>
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {isLastStep ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};

const Questionnaire = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [shakeFields, setShakeFields] = useState(false);

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field immediately and update errors
    const error = validateField({ name, required: QUESTIONNAIRE_STEPS[currentStep].fields.find(f => f.name === name)?.required }, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    // If the field now has a valid value, remove the shake animation
    if (!error && value) {
      setShakeFields(false);
    }
  };

  const handleNext = () => {
    if (currentStep === QUESTIONNAIRE_STEPS.length - 1) {
      onComplete(formData);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <QuestionnaireStep
        step={QUESTIONNAIRE_STEPS[currentStep]}
        formData={formData}
        onChange={handleFieldChange}
        onNext={handleNext}
        onBack={handleBack}
        isLastStep={currentStep === QUESTIONNAIRE_STEPS.length - 1}
      />
    </div>
  );
};

export default Questionnaire; 