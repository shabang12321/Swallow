import React, { useState, useRef, useEffect, useCallback } from 'react';
import OpenAI from 'openai';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../contexts/ThemeContext';
import { createChatSession, updateChatSession } from '../services/firebase/chatHistory';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';

// Define initial welcome message
const initialMessage = "Hello! I'm Swallow Hero AI. How can I help you with your supplement needs today?";

// Message formatting components
const BoldText = ({ text }) => {
  const { profileTheme } = useTheme();
  
  // Get gradient colors based on theme
  let gradientStart, gradientEnd;
      
  if (profileTheme === 'ocean') {
    gradientStart = '#0ea5e9'; // sky-500
    gradientEnd = '#10b981';   // teal-500
  } else if (profileTheme === 'sunset') {
    gradientStart = '#9333ea'; // purple-600
    gradientEnd = '#e11d48';   // rose-600
  } else { // citrus
    gradientStart = '#f97316'; // orange-500
    gradientEnd = '#84cc16';   // lime-500
  }
  
  // Enhanced processing for specific headings - use exact string matching
  if (text === 'Analyzing Your Profile' || 
      text === 'Welcome to Swallow Hero AI' || 
      text.includes('Analyzing Your Profile') ||
      text.includes('Welcome to Swallow Hero')) {
  return (
      <div 
        className="mt-2 mb-2 text-transparent bg-clip-text"
      style={{ 
          backgroundImage: `linear-gradient(to right, ${gradientStart}, ${gradientEnd})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
          color: 'transparent',
          fontSize: '1.25rem',
        lineHeight: '1.75rem',
        fontWeight: 700
        }}
      >
      {text.replace(/^\*\*|\*\*$/g, '')}
    </div>
  );
  }
  
  return <span className="font-bold">{text}</span>;
};

const BulletList = ({ title, items }) => (
  <div className="space-y-2">
    {title && <p className="font-semibold">{title}</p>}
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start space-x-2">
          <span className="text-sky-500 mt-1">•</span>
          <span>{item.replace(/^[-•]\s*/, '')}</span>
        </li>
      ))}
    </ul>
  </div>
);

const SupplementInfo = ({ title, details }) => (
  <div className="space-y-2">
    <p className="font-semibold">{title}</p>
    <div className="pl-4 space-y-1">
      {details.map((detail, i) => (
        <p key={i} className="flex items-start space-x-2">
          {detail.includes(':') ? (
            <>
              <span className="text-sky-500">•</span>
              <span>
                <span className="font-medium">{detail.split(':')[0]}:</span>
                {detail.split(':')[1]}
              </span>
            </>
          ) : (
            <span>{detail}</span>
          )}
        </p>
      ))}
    </div>
  </div>
);

// Standardize a function to create theme gradient styles for headings
const getThemeGradientStyle = (profileTheme) => {
  // Get gradient colors based on theme
  let gradientStart, gradientEnd;
  let themeClasses = '';
  
  if (profileTheme === 'ocean') {
    gradientStart = '#0ea5e9'; // sky-500
    gradientEnd = '#10b981';   // teal-500
    themeClasses = 'from-sky-500 via-teal-500 to-green-500';
  } else if (profileTheme === 'sunset') {
    gradientStart = '#9333ea'; // purple-600
    gradientEnd = '#e11d48';   // rose-600
    themeClasses = 'from-purple-600 via-pink-600 to-rose-600';
  } else { // citrus
    gradientStart = '#f97316'; // orange-500
    gradientEnd = '#84cc16';   // lime-500
    themeClasses = 'from-orange-500 via-yellow-400 to-lime-500';
  }
  
  return {
    className: `text-transparent bg-clip-text bg-gradient-to-r ${themeClasses}`,
    style: {
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent'
    }
  };
};

// Function to style vitamin names with double asterisks
const styleVitaminNames = (text, gradientStyle) => {
  if (!text || !text.includes('**')) return text;
  
  // Split by double asterisks and process
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, i) => {
    // Check if this part is surrounded by double asterisks
    if (part.startsWith('**') && part.endsWith('**')) {
      const vitaminName = part.replace(/^\*\*|\*\*$/g, '');
      return (
        <span 
          key={i} 
          className={gradientStyle.className}
          style={{
            ...gradientStyle.style,
            fontWeight: 'bold',
            display: 'inline',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          {vitaminName}
        </span>
      );
    }
    return part;
  });
};

const formatMessageContent = (content, profileTheme, themeGradientFunc) => {
  // Only format if content exists and is a string
  if (!content || typeof content !== 'string') return content;
  
  // Get theme gradient style - handle both function types
  let gradientStyle;
  if (themeGradientFunc) {
    // If we're passed the ThemeContext's getThemeGradient
    const gradientClass = themeGradientFunc(profileTheme);
    gradientStyle = {
      className: `text-transparent bg-clip-text bg-gradient-to-r ${gradientClass}`,
      style: {
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent'
      }
    };
  } else {
    // Use the local getThemeGradientStyle function
    gradientStyle = getThemeGradientStyle(profileTheme);
  }
  
  // Split content by double newlines to identify sections
  const sections = content.split(/\n\n+/);
  
  return sections.map((section, index) => {
    // Skip empty sections
    if (!section.trim()) return null;
    
    // Use the styleVitaminNames function with gradientStyle parameter
    const processText = (text) => styleVitaminNames(text, gradientStyle);
    
    // Check for Personalized Supplement Analysis header
    if (section.startsWith('**') && section.endsWith('**') && section.includes('Personalized Supplement Analysis')) {
      return (
        <div key={index} className="mt-4 mb-2">
          <h3 
            className={`text-xl font-bold ${gradientStyle.className}`}
            style={{
              ...gradientStyle.style,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Personalized Supplement Analysis
          </h3>
        </div>
      );
    }
    
    // Supplement headers - any text with asterisks (e.g., "**Vitamin B12**")
    if (section.startsWith('**') && section.endsWith('**')) {
      const supplementName = section.replace(/^\*\*|\*\*$/g, '');
      
      // Special cases for welcome and analyzing messages
      if (supplementName.includes('Welcome to Swallow Hero') || 
          supplementName === 'Welcome to Swallow Hero AI' ||
          supplementName.includes('Analyzing Your Profile') ||
          supplementName === 'Analyzing Your Profile' ||
          supplementName.includes('Personalized Supplement Analysis')) {
        
      return (
          <div key={index} className="mt-4">
            <h3 
              className={`text-xl font-bold ${gradientStyle.className}`}
              style={{
                ...gradientStyle.style,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {supplementName}
            </h3>
        </div>
        );
      }
      
      // For any text with asterisks (including supplement names), apply theme gradient styling
      return (
        <div key={index} className="mt-4">
          <h3 
            className={`text-lg font-bold ${gradientStyle.className}`}
            style={{
              ...gradientStyle.style,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            {supplementName}
          </h3>
        </div>
      );
    }
    
    // Purpose and Dosage bullet points
    if (section.includes('**Purpose:**') || section.includes('**Dosage:**')) {
      const lines = section.split('\n');
      
      // Get theme gradient for bullet points 
      let bulletColor;
      if (profileTheme === 'ocean') {
        bulletColor = 'text-sky-500';
      } else if (profileTheme === 'sunset') {
        bulletColor = 'text-purple-600';
      } else { // citrus
        bulletColor = 'text-orange-500';
      }
      
      return (
        <ul key={index} className="mt-1 mb-3 space-y-1">
          {lines.map((line, i) => {
            if (line.includes('**Purpose:**')) {
              // Clean up by removing any dashes or extra spaces after the colon
              const purposeContent = line.replace('**Purpose:**', '').replace(/^\s*-?\s*/, ' ').trim();
              return (
                <li key={`purpose-${i}`} className="flex items-start">
                  <span className={`${bulletColor} mr-2 mt-1`}>•</span>
                  <span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">Purpose: </span>
                    {processText(purposeContent)}
                  </span>
                </li>
              );
            }
            if (line.includes('**Dosage:**')) {
              // Clean up by removing any dashes or extra spaces after the colon
              const dosageContent = line.replace('**Dosage:**', '').replace(/^\s*-?\s*/, ' ').trim();
              return (
                <li key={`dosage-${i}`} className="flex items-start">
                  <span className={`${bulletColor} mr-2 mt-1`}>•</span>
                  <span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">Dosage: </span>
                    {processText(dosageContent)}
                  </span>
                </li>
              );
            }
            // For other lines (vitamin names), don't show bullet points
            return (
              <div key={i} className="pl-2 py-0.5">
                {processText(line.replace(/^[-•]\s*/, ''))}
              </div>
            );
          })}
        </ul>
      );
    }
    
    // Important Notes section
    if (section.toLowerCase().includes('**important notes:**')) {
      const [header, ...notes] = section.split('\n');
      return (
        <div key={index} className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800/50">
          <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-400 mb-2">
            Important Notes:
          </h3>
          <ul className="space-y-1.5">
            {notes.map((note, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-gray-800 dark:text-gray-200">{processText(note.replace(/^[-•]\s*/, ''))}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    // "Analyzing Your Profile" message - match user's theme
    if (section.includes('Analyzing Your Profile')) {
      // Extract the header text from the bold markers
      const headerText = section.match(/\*\*(.*?)\*\*/)?.[1] || 'Analyzing Your Profile';
      const contentText = section.replace(/\*\*.*?\*\*/, '').trim();
      
      // Get background based on theme
      const bgGradient = profileTheme === 'ocean' ? 
        "from-sky-50/80 to-teal-50/50 dark:from-sky-900/20 dark:to-teal-800/10 border-sky-100 dark:border-sky-800/30" :
        profileTheme === 'sunset' ? 
        "from-pink-50/80 to-purple-50/50 dark:from-pink-900/20 dark:to-purple-800/10 border-pink-100 dark:border-pink-800/30" :
        "from-yellow-50/80 to-lime-50/50 dark:from-yellow-900/20 dark:to-lime-800/10 border-yellow-100 dark:border-yellow-800/30";
      
      return (
        <div key={index} className={`my-4 p-4 bg-gradient-to-r ${bgGradient} rounded-lg border`}>
          <h3 
            className={`text-xl font-bold mb-2 ${gradientStyle.className}`}
            style={gradientStyle.style}
          >
            {headerText}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">{processText(contentText)}</p>
        </div>
      );
    }
    
    // Welcome message - match user's theme
    if (section.includes('Welcome to Swallow Hero')) {
      // Extract the header text from the bold markers
      const headerText = section.match(/\*\*(.*?)\*\*/)?.[1] || 'Welcome to Swallow Hero AI';
      const contentText = section.replace(/\*\*.*?\*\*/, '').trim();
      
      // Get background based on theme
      const bgGradient = profileTheme === 'ocean' ? 
        "from-sky-50/80 to-teal-50/50 dark:from-sky-900/20 dark:to-teal-800/10 border-sky-100 dark:border-sky-800/30" :
        profileTheme === 'sunset' ? 
        "from-pink-50/80 to-purple-50/50 dark:from-pink-900/20 dark:to-purple-800/10 border-pink-100 dark:border-pink-800/30" :
        "from-yellow-50/80 to-lime-50/50 dark:from-yellow-900/20 dark:to-lime-800/10 border-yellow-100 dark:border-yellow-800/30";
      
      return (
        <div key={index} className={`my-4 p-4 bg-gradient-to-r ${bgGradient} rounded-lg border`}>
          <h3 
            className={`text-xl font-bold mb-2 ${gradientStyle.className}`}
            style={gradientStyle.style}
          >
            {headerText}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">{processText(contentText)}</p>
        </div>
      );
    }
    
    // Regular paragraph
    return <p key={index} className="mb-4 text-gray-800 dark:text-gray-200">{processText(section)}</p>;
  });
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Questionnaire configuration
const QUESTIONNAIRE_STEPS = [
  {
    id: 'basics',
    title: 'Basic Information',
    fields: [
      { 
        name: 'age', 
        label: 'Age Range', 
        type: 'select', 
        options: [
          'Under 18',
          '18-24',
          '25-34',
          '35-44',
          '45-54',
          '55-64',
          '65+'
        ],
        required: true 
      },
      { 
        name: 'sex', 
        label: 'Sex', 
        type: 'radio-group',
        options: ['Male', 'Female', 'Other'],
        required: true 
      },
      { 
        name: 'height', 
        label: 'Height (cm)', 
        type: 'range', 
        min: 50,
        max: 250,
        defaultValue: 170,
        allowCustomInput: true,
        required: true 
      },
      { 
        name: 'weight', 
        label: 'Weight (kg)', 
        type: 'range',
        min: 20,
        max: 200,
        defaultValue: 70,
        allowCustomInput: true,
        required: true 
      },
    ]
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle & Diet',
    fields: [
      { 
        name: 'activityLevel', 
        label: 'Activity Level', 
        type: 'select',
        options: ['Limited', 'Light', 'Moderate', 'Heavy', 'Athlete'],
        required: true 
      },
      { 
        name: 'dietType', 
        label: 'Diet Type', 
        type: 'select',
        options: ['Inconsistent', 'Balanced','Vegan/Vegetarian', 'Pescatarian', 'Keto', 'Other'],
        required: true 
      },
      { 
        name: 'dietaryRestrictions', 
        label: 'Dietary Restrictions', 
        type: 'multiselect',
        options: ['Gluten-Free', 'Dairy-Free', 'Nut Allergy', 'Soy Allergy', 'None'],
        required: false 
      },
    ]
  },
  {
    id: 'health',
    title: 'Health Information',
    fields: [
      { 
        name: 'healthConcerns', 
        label: 'Areas You Want to Improve', 
        description: 'Select the areas of your health and wellness that you would like to enhance with supplements',
        type: 'multiselect',
        options: [
          'Energy & Vitality',
          'Sleep & Relaxation',
          'Joint & Mobility',
          'Digestive Health',
          'Immune System',
          'Stress & Mood',
          'Weight Management',
          'Muscle & Strength',
        ],
        required: true 
      },
      { 
        name: 'medicalConditions', 
        label: 'Existing Medical Conditions', 
        type: 'text',
        placeholder: 'List any diagnosed conditions',
        required: false 
      },
      { 
        name: 'medications', 
        label: 'Current Medications or Supplements', 
        type: 'text',
        placeholder: 'List any medications or supplements you take',
        required: false 
      },
    ]
  }
];

const QuestionnaireStep = ({ step, formData, onChange, onNext, onBack, isLastStep }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showCustomInput, setShowCustomInput] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [shakeFields, setShakeFields] = useState(false);

  // Reset showErrors when step changes
  useEffect(() => {
    setShowErrors(false);
    setShakeFields(false);
  }, [step]);

  const validateField = (fieldName, value) => {
    const field = step.fields.find(f => f.name === fieldName);
    if (!field) return null;

    if (field.required && !value) {
      return 'This field is required';
    }
    
    // For multiselect, check if array is empty
    if (field.required && field.type === 'multiselect' && 
        Array.isArray(value) && value.length === 0) {
      return 'This field is required';
    }
    
    if (field.type === 'number' && value) {
      const num = Number(value);
      if (field.name === 'age' && (num < 18 || num > 120)) {
        return 'Please enter a valid age between 18 and 120';
      }
      if (field.name === 'height' && num < 0) {
        return 'Height cannot be negative';
      }
      if (field.name === 'weight' && num < 0) {
        return 'Weight cannot be negative';
      }
    }
    
    return null;
  };

  const validateStep = () => {
    const newErrors = {};
    step.fields.forEach(field => {
      const error = validateField(field.name, formData[field.name]);
      if (error) newErrors[field.name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (name, value) => {
    // Update form data
    onChange(name, value);
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate this field and update errors immediately
    const error = validateField(name, value);
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
    // Mark all fields as touched when trying to proceed
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

  const renderField = (field) => {
    const value = formData[field.name] !== undefined ? formData[field.name] : field.defaultValue;
    const error = touched[field.name] && errors[field.name];
    
    // Only show error styling if there's an error or if showErrors is true and the field is required and empty
    const isErrorField = error || (showErrors && field.required && !formData[field.name]);
    
    // For multiselect, check if array is empty
    const isMultiselectError = field.type === 'multiselect' && field.required && 
                              (!Array.isArray(formData[field.name]) || formData[field.name].length === 0);
    
    // Only apply shake-error class if shakeFields is true
    const fieldErrorClass = isErrorField && shakeFields ? 'shake-error' : isErrorField ? 'error-outline' : '';
    const multiselectErrorClass = (error || (showErrors && isMultiselectError)) && shakeFields ? 'shake-error' : 
                                 (error || (showErrors && isMultiselectError)) ? 'error-outline' : '';

    switch (field.type) {
      case 'range':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min={field.min}
                max={field.max}
                value={Math.min(Math.max(value || field.defaultValue, field.min), field.max)}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                onFocus={() => handleFieldFocus(field.name)}
                className={`flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-sky-500 dark:accent-sky-400 ${fieldErrorClass}`}
              />
              {field.allowCustomInput && !showCustomInput[field.name] ? (
                <button
                  onClick={() => {
                    setShowCustomInput(prev => ({ ...prev, [field.name]: true }));
                    handleFieldChange(field.name, value);
                  }}
                  className={`w-20 px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:border-sky-500 transition-colors text-center dark:text-white ${fieldErrorClass}`}
                >
                  {value} {field.name === 'height' ? 'cm' : 'kg'}
                </button>
              ) : field.allowCustomInput ? (
                <input
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => {
                    const newValue = Math.max(0, Number(e.target.value)) || '';
                    handleFieldChange(field.name, newValue.toString());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.target.blur();
                    }
                    // Prevent minus sign
                    if (e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                  onBlur={() => {
                    if (!formData[field.name] && formData[field.name] !== '0') {
                      handleFieldChange(field.name, field.defaultValue.toString());
                    }
                    setShowCustomInput(prev => ({ ...prev, [field.name]: false }));
                  }}
                  className={`w-20 px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-200 text-center dark:bg-gray-700 dark:text-white ${fieldErrorClass}`}
                  autoFocus
                />
              ) : (
                <span className="w-20 text-center text-sm text-gray-600 dark:text-gray-300">
                  {value} {field.name === 'height' ? 'cm' : 'kg'}
                </span>
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{field.min} {field.name === 'height' ? 'cm' : 'kg'}</span>
              <span>{field.max} {field.name === 'height' ? 'cm' : 'kg'}</span>
            </div>
          </div>
        );

      case 'select':
        return (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onFocus={() => handleFieldFocus(field.name)}
              className={`w-full p-2 border rounded-md focus:ring-1 transition-all duration-200
                ${isErrorField ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-sky-200 dark:border-gray-600'}
                ${value && !isErrorField ? 'border-green-200 dark:border-green-700' : ''}
                appearance-none bg-white dark:bg-gray-700 dark:text-white ${fieldErrorClass}`}
            >
              <option value="">Select {field.label.toLowerCase()}...</option>
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        );

      case 'multiselect':
        return (
          <div className={`space-y-1 p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 ${multiselectErrorClass}`}>
            {field.options.map(option => (
              <label key={option} className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-600 rounded transition-colors duration-150">
                <input
                  type="checkbox"
                  checked={formData[field.name]?.includes(option) || false}
                  onChange={(e) => {
                    const current = formData[field.name] || [];
                    const value = e.target.checked
                      ? [...current, option]
                      : current.filter(item => item !== option);
                    handleFieldChange(field.name, value);
                  }}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-1 focus:ring-sky-200 transition-all duration-200"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio-group':
        return (
          <div className={`flex justify-between items-center space-x-4 p-2 rounded-md ${isErrorField ? 'error-outline' : ''} ${fieldErrorClass}`}>
            {field.options.map(option => (
              <label
                key={option}
                className={`flex-1 text-center p-2 border rounded-lg cursor-pointer transition-all duration-200
                  ${value === option 
                    ? 'bg-sky-500 text-white border-sky-500' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-sky-500 dark:hover:border-sky-400'}`}
              >
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  onFocus={() => handleFieldFocus(field.name)}
                  className="hidden"
                />
                {option}
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            onFocus={() => handleFieldFocus(field.name)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={`w-full p-2 border rounded-md focus:ring-1 transition-all duration-200
              ${isErrorField ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:ring-sky-200'}
              ${value && !isErrorField ? 'border-green-200 dark:border-green-700' : ''}
              dark:bg-gray-700 dark:text-white ${fieldErrorClass}`}
          />
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300"
      style={{ 
        isolation: 'isolate',
        position: 'relative',
        zIndex: 1,
        backgroundImage: 'none !important',
        backdropFilter: 'none !important',
        WebkitBackdropFilter: 'none !important'
      }}
    >
      <div className="p-4 relative z-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{step.title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Please fill in the following information.</p>
        
        <div className="space-y-6">
          {step.fields.map(field => (
            <div key={field.name} className="space-y-2">
              <label className="block text-base font-semibold text-gray-800 dark:text-gray-200">
                {field.label} {field.required && <span className="text-red-500 dark:text-red-400">*</span>}
              </label>
              
              {renderField(field)}
              
              {errors[field.name] && touched[field.name] && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  {errors[field.name]}
                </p>
              )}
              
              {!errors[field.name] && showErrors && field.required && !formData[field.name] && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  This field is required
                </p>
              )}
              
              {!errors[field.name] && showErrors && field.required && field.type === 'multiselect' && 
               Array.isArray(formData[field.name]) && formData[field.name].length === 0 && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  This field is required
                </p>
              )}
              
              {field.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {field.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center rounded-b-xl">
        <button
          type="button"
          onClick={onBack}
          className={`btn-outline btn-sm text-gray-600 dark:text-gray-300 ${!onBack ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <svg className="w-4 h-4 icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        
        <button
          type="button"
          onClick={handleNext}
          className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg [&>span]:text-white [&>svg]:text-white"
        >
          <span className="text-white">{isLastStep ? 'Start Chat' : 'Next'}</span>
          <svg className="w-4 h-4 icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Add these constants at the top of the file
const ANALYSIS_FORMAT_TEMPLATE = `IMPORTANT: Your next response MUST follow this exact format:

**Personalized Supplement Analysis**

**[Supplement Name]**
- **Purpose:** [Personalised, Brief and Clear purpose]
- **Dosage:** [Personalised Clear dosage]

[Repeat for each recommended supplement]

**Important Notes:**
- [Safety notes]
- [Additional recommendations]`;

const WELCOME_MESSAGES = {
  initial: {
    text: "**Welcome to Swallow Hero AI**\n\nI'm here to help you live your best life!",
    sender: 'ai'
  },
  analyzing: {
    text: "**Analyzing Your Profile**\n\nI'm analyzing your health profile to create personalised supplement recommendations for you. One moment please...",
    sender: 'ai'
  }
};

const SYSTEM_MESSAGE = {
  role: "system",
  content: `You are Swallow Hero, a professional vitamin and supplement advisor. You MUST format EVERY response, including your first response, using this exact structure:

RESPONSE FORMAT:
When analyzing a health profile, respond with:

**Personalized Supplement Analysis**

**[Supplement Name]**
- **Purpose:** [Brief, clear explanation of the benefit]
- **Dosage:** [Clear dosage recommendation]

[Repeat for each recommended supplement]

**Important Notes:**
- [Safety disclaimers]
- [Additional personalised notes]

RULES:
- All supplement names MUST be in bold with proper capitalization
- Each "Purpose:" and "Dosage:" label must be bold
- Section titles must be bold with proper capitalization
- Keep supplement recommendations to 3-5 key supplements most relevant to the user
- Recommendations must be evidence-based and personalized to the user's profile
- Always include important notes about consulting healthcare professionals`
};

// Add a new component for the horizontal health profile display
const HorizontalHealthProfile = ({ profileData }) => {
  const { profileTheme, getThemeGradient } = useTheme();
  
  if (!profileData) return null;
  
  // Extract the first message that contains the health profile
  const profileMessage = profileData.find(msg => 
    msg.role === 'assistant' && 
    msg.content.includes('BASIC INFORMATION')
  );
  
  if (!profileMessage) return null;

  // Get theme colors based on user's selected theme
  const themeColors = {
    basic: {
      bg: profileTheme === 'ocean' ? 'from-sky-100/80 to-sky-200/50 dark:from-sky-800/30 dark:to-sky-700/20' :
           profileTheme === 'sunset' ? 'from-orange-100/80 to-orange-200/50 dark:from-orange-800/30 dark:to-orange-700/20' :
           'from-yellow-100/80 to-yellow-200/50 dark:from-yellow-800/30 dark:to-yellow-700/20',
      border: profileTheme === 'ocean' ? 'border-sky-200/50 dark:border-sky-700/30' :
              profileTheme === 'sunset' ? 'border-orange-200/50 dark:border-orange-700/30' :
              'border-yellow-200/50 dark:border-yellow-700/30',
      text: profileTheme === 'ocean' ? 'text-sky-800 dark:text-sky-300' :
            profileTheme === 'sunset' ? 'text-orange-800 dark:text-orange-300' :
            'text-yellow-800 dark:text-yellow-300',
      bullet: profileTheme === 'ocean' ? 'text-sky-500 dark:text-sky-400' :
              profileTheme === 'sunset' ? 'text-orange-500 dark:text-orange-400' :
              'text-yellow-500 dark:text-yellow-400'
    },
    lifestyle: {
      bg: profileTheme === 'ocean' ? 'from-teal-100/80 to-teal-200/50 dark:from-teal-800/30 dark:to-teal-700/20' :
          profileTheme === 'sunset' ? 'from-red-100/80 to-red-200/50 dark:from-red-800/30 dark:to-red-700/20' :
          'from-lime-100/80 to-lime-200/50 dark:from-lime-800/30 dark:to-lime-700/20',
      border: profileTheme === 'ocean' ? 'border-teal-200/50 dark:border-teal-700/30' :
              profileTheme === 'sunset' ? 'border-red-200/50 dark:border-red-700/30' :
              'border-lime-200/50 dark:border-lime-700/30',
      text: profileTheme === 'ocean' ? 'text-teal-800 dark:text-teal-300' :
            profileTheme === 'sunset' ? 'text-red-800 dark:text-red-300' :
            'text-lime-800 dark:text-lime-300',
      bullet: profileTheme === 'ocean' ? 'text-teal-500 dark:text-teal-400' :
              profileTheme === 'sunset' ? 'text-red-500 dark:text-red-400' :
              'text-lime-500 dark:text-lime-400'
    },
    health: {
      bg: profileTheme === 'ocean' ? 'from-blue-100/80 to-blue-200/50 dark:from-blue-800/30 dark:to-blue-700/20' :
          profileTheme === 'sunset' ? 'from-pink-100/80 to-pink-200/50 dark:from-pink-800/30 dark:to-pink-700/20' :
          'from-green-100/80 to-green-200/50 dark:from-green-800/30 dark:to-green-700/20',
      border: profileTheme === 'ocean' ? 'border-blue-200/50 dark:border-blue-700/30' :
              profileTheme === 'sunset' ? 'border-pink-200/50 dark:border-pink-700/30' :
              'border-green-200/50 dark:border-green-700/30',
      text: profileTheme === 'ocean' ? 'text-blue-800 dark:text-blue-300' :
            profileTheme === 'sunset' ? 'text-pink-800 dark:text-pink-300' :
            'text-green-800 dark:text-green-300',
      bullet: profileTheme === 'ocean' ? 'text-blue-500 dark:text-blue-400' :
              profileTheme === 'sunset' ? 'text-pink-500 dark:text-pink-400' :
              'text-green-500 dark:text-green-400'
    },
    supplements: {
      bg: profileTheme === 'ocean' ? 'from-indigo-100/80 to-indigo-200/50 dark:from-indigo-800/30 dark:to-indigo-700/20' :
          profileTheme === 'sunset' ? 'from-purple-100/80 to-purple-200/50 dark:from-purple-800/30 dark:to-purple-700/20' :
          'from-emerald-100/80 to-emerald-200/50 dark:from-emerald-800/30 dark:to-emerald-700/20',
      border: profileTheme === 'ocean' ? 'border-indigo-200/50 dark:border-indigo-700/30' :
              profileTheme === 'sunset' ? 'border-purple-200/50 dark:border-purple-700/30' :
              'border-emerald-200/50 dark:border-emerald-700/30',
      text: profileTheme === 'ocean' ? 'text-indigo-800 dark:text-indigo-300' :
            profileTheme === 'sunset' ? 'text-purple-800 dark:text-purple-300' :
            'text-emerald-800 dark:text-emerald-300',
      bullet: profileTheme === 'ocean' ? 'text-indigo-500 dark:text-indigo-400' :
              profileTheme === 'sunset' ? 'text-purple-500 dark:text-purple-400' :
              'text-emerald-500 dark:text-emerald-400'
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-sky-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white shadow-sm mb-4 rounded-md overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-center font-bold text-sm sm:text-base tracking-wider text-gray-900 dark:text-white">YOUR HEALTH PROFILE SUMMARY</h3>
      </div>
      
      <div className="p-3 overflow-x-auto">
        <div className="flex flex-wrap gap-4 justify-center">
          {/* Basic Information */}
          <div className={`flex-1 min-w-[220px] max-w-[280px] bg-gradient-to-br ${themeColors.basic.bg} rounded-lg p-3 shadow-sm border ${themeColors.basic.border}`}>
            <h4 className={`text-sm font-semibold mb-2 flex items-center ${themeColors.basic.text}`}>
              <span className="text-lg mr-2">🧑‍💼</span> 
              <span>BASIC INFORMATION</span>
            </h4>
            <div className="space-y-2 text-sm">
              {profileMessage.content.match(/• Age: ([^\n]+)/)?.[1] && (
                <div className="flex items-start">
                  <span className={`mr-2 ${themeColors.basic.bullet}`}>•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Age:</span> 
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{profileMessage.content.match(/• Age: ([^\n]+)/)[1]}</span>
                  </div>
                </div>
              )}
              {profileMessage.content.match(/• Sex: ([^\n]+)/)?.[1] && (
                <div className="flex items-start">
                  <span className={`mr-2 ${themeColors.basic.bullet}`}>•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Sex:</span> 
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{profileMessage.content.match(/• Sex: ([^\n]+)/)[1]}</span>
                  </div>
                </div>
              )}
              {profileMessage.content.match(/• Height: ([^\n]+)/)?.[1] && (
                <div className="flex items-start">
                  <span className={`mr-2 ${themeColors.basic.bullet}`}>•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Height:</span> 
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{profileMessage.content.match(/• Height: ([^\n]+)/)[1]}</span>
                  </div>
                </div>
              )}
              {profileMessage.content.match(/• Weight: ([^\n]+)/)?.[1] && (
                <div className="flex items-start">
                  <span className={`mr-2 ${themeColors.basic.bullet}`}>•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Weight:</span> 
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{profileMessage.content.match(/• Weight: ([^\n]+)/)[1]}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Lifestyle & Diet */}
          <div className={`flex-1 min-w-[220px] max-w-[280px] bg-gradient-to-br ${themeColors.lifestyle.bg} rounded-lg p-3 shadow-sm border ${themeColors.lifestyle.border}`}>
            <h4 className={`text-sm font-semibold mb-2 flex items-center ${themeColors.lifestyle.text}`}>
              <span className="text-lg mr-2">🍽️</span> 
              <span>LIFESTYLE & DIET</span>
            </h4>
            <div className="space-y-2 text-sm">
              {profileMessage.content.match(/• Activity: ([^\n]+)/)?.[1] && (
                <div className="flex items-start">
                  <span className={`mr-2 ${themeColors.lifestyle.bullet}`}>•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Activity:</span> 
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{profileMessage.content.match(/• Activity: ([^\n]+)/)[1]}</span>
                  </div>
                </div>
              )}
              {profileMessage.content.match(/• Diet: ([^\n]+)/)?.[1] && (
                <div className="flex items-start">
                  <span className={`mr-2 ${themeColors.lifestyle.bullet}`}>•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Diet:</span> 
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{profileMessage.content.match(/• Diet: ([^\n]+)/)[1]}</span>
                  </div>
                </div>
              )}
              {profileMessage.content.match(/• Restrictions: ([^\n]+)/)?.[1] && (
                <div className="flex items-start">
                  <span className={`mr-2 ${themeColors.lifestyle.bullet}`}>•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Restrictions:</span> 
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{profileMessage.content.match(/• Restrictions: ([^\n]+)/)[1]}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Health Status */}
          <div className={`flex-1 min-w-[220px] max-w-[280px] bg-gradient-to-br ${themeColors.health.bg} rounded-lg p-3 shadow-sm border ${themeColors.health.border}`}>
            <h4 className={`text-sm font-semibold mb-2 flex items-center ${themeColors.health.text}`}>
              <span className="text-lg mr-2">🩺</span> 
              <span>HEALTH STATUS</span>
            </h4>
            <div className="space-y-2 text-sm">
              {profileMessage.content.match(/• Concerns: ([^\n]+)/)?.[1] && (
                <div className="flex items-start">
                  <span className={`mr-2 ${themeColors.health.bullet}`}>•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Concerns:</span> 
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{profileMessage.content.match(/• Concerns: ([^\n]+)/)[1]}</span>
                  </div>
                </div>
              )}
              {profileMessage.content.match(/• Medical: ([^\n]+)/)?.[1] && (
                <div className="flex items-start">
                  <span className={`mr-2 ${themeColors.health.bullet}`}>•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Medical:</span> 
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{profileMessage.content.match(/• Medical: ([^\n]+)/)[1]}</span>
                  </div>
                </div>
              )}
              {profileMessage.content.match(/• Medications: ([^\n]+)/)?.[1] && (
                <div className="flex items-start">
                  <span className={`mr-2 ${themeColors.health.bullet}`}>•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Medications:</span> 
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{profileMessage.content.match(/• Medications: ([^\n]+)/)[1]}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Current Supplements */}
          <div className={`flex-1 min-w-[220px] max-w-[280px] bg-gradient-to-br ${themeColors.supplements.bg} rounded-lg p-3 shadow-sm border ${themeColors.supplements.border}`}>
            <h4 className={`text-sm font-semibold mb-2 flex items-center ${themeColors.supplements.text}`}>
              <span className="text-lg mr-2">💊</span> 
              <span>CURRENT SUPPLEMENTS</span>
            </h4>
            <div className="space-y-2 text-sm">
              {profileMessage.content.match(/• Current: ([^\n]+)/)?.[1] && (
                <div className="flex items-start">
                  <span className={`mr-2 ${themeColors.supplements.bullet}`}>•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Current:</span> 
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{profileMessage.content.match(/• Current: ([^\n]+)/)[1]}</span>
                  </div>
                </div>
              )}
              {profileMessage.content.match(/• Goals: ([^\n]+)/)?.[1] && (
                <div className="flex items-start">
                  <span className={`mr-2 ${themeColors.supplements.bullet}`}>•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Goals:</span> 
                    <span className="ml-1 text-gray-800 dark:text-gray-200">{profileMessage.content.match(/• Goals: ([^\n]+)/)[1]}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatInterface = ({ 
  currentChatId: initialChatId, 
  initialMessages = [], 
  shouldStartNewChat = false, 
  onChatCreated = () => {},
  showQuestionnaire = false,
  onQuestionnaireComplete = () => {}
}) => {
  // Filter out system messages for display, but keep them for API calls
  const filteredInitialMessages = initialMessages.filter(msg => msg.role !== 'system');
  
  const [messages, setMessages] = useState(() => {
    if (initialMessages.length > 0) {
      return initialMessages;
    } else {
      return [{
        role: 'assistant',
        content: initialMessage,
      }];
    }
  });
  
  // Add useState hook for questionnaire visibility that's controlled by the prop
  const [localShowQuestionnaire, setLocalShowQuestionnaire] = useState(showQuestionnaire);
  
  // Update local state when props change
  useEffect(() => {
    setLocalShowQuestionnaire(showQuestionnaire);
  }, [showQuestionnaire]);
  
  const [currentChatId, setCurrentChatId] = useState(initialChatId);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    // Check if user has seen disclaimer in this session
    const hasSeenDisclaimer = localStorage.getItem('swallow_hero_seen_disclaimer');
    return !hasSeenDisclaimer;
  });
  const [showWelcome, setShowWelcome] = useState(shouldStartNewChat);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const messagesEndRef = useRef(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [user] = useAuthState(auth);
  
  // Initialize OpenAI client
  const openai = React.useMemo(() => {
    try {
      // Log available environment variables (excluding the actual API key)
      console.log('Environment variables available:', {
        REACT_APP_KEYS: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')),
        NODE_ENV: process.env.NODE_ENV
      });

      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      
      if (!apiKey) {
        console.error('API key is missing. Available env vars:', 
          Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
        throw new Error('OpenAI API key is not configured');
      }

      // Log API key length and prefix (safely)
      console.log('API Key Info:', {
        length: apiKey.length,
        prefix: apiKey.substring(0, 10) + '...',
        isDefined: Boolean(apiKey)
      });

      const client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
        maxRetries: 3,
        timeout: 30000, // 30 seconds
      });

      // Test the client configuration
      console.log('OpenAI client configured successfully:', {
        isConfigured: Boolean(client),
        hasApiKey: Boolean(client.apiKey),
      });

      return client;
    } catch (error) {
      console.error('Detailed error initializing OpenAI client:', {
        error: error,
        message: error.message,
        stack: error.stack,
        envVarsExist: Boolean(process.env.REACT_APP_OPENAI_API_KEY)
      });
      setError(`API configuration error: ${error.message}`);
      return null;
    }
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  };

  useEffect(() => {
    // Only scroll if there are messages
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const makeOpenAIRequest = async (messages, retryCount = 0) => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You MUST format your response exactly as specified in the system message, with bold headers and bold labels."
          },
          ...messages
        ],
        temperature: 0.3,
        max_tokens: 1000,
        presence_penalty: 0.0,
        frequency_penalty: 0.0,
        top_p: 0.95,
      });

      // Return just the response content, not the whole completion object
      return completion.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API error:", error);
      if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
        await sleep(RETRY_DELAY * (retryCount + 1));
        return makeOpenAIRequest(messages, retryCount + 1);
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event propagation
    
    if (!inputMessage.trim()) return;
    if (!openai) {
      setError('Chat is currently unavailable. Please try again later.');
      return;
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: inputMessage
    };

    // Create a copy of messages with the new user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Prepare conversation history for OpenAI
      // Ensure there's a system message at the beginning
      let conversationHistory = [...updatedMessages];
      
      // Check if there's already a system message
      if (!conversationHistory.some(msg => msg.role === 'system')) {
        // Add system message at the beginning
        conversationHistory = [
          {
            role: "system",
            content: "You are a helpful AI assistant focused on providing supplement recommendations and health advice based on the user's profile. Remember that all advice should be general in nature and users should consult healthcare professionals before making changes to their health regimen."
          },
          ...conversationHistory
        ];
      }

      console.log('Sending request to OpenAI...');

      // Get AI response
      const aiResponse = await makeOpenAIRequest(conversationHistory);
      
      // Create AI message
      const assistantMessage = {
        role: 'assistant',
        content: aiResponse
      };
      
      // Update messages with AI response (but don't include system message in UI)
      const finalUIMessages = [...updatedMessages, assistantMessage];
      setMessages(finalUIMessages);
      
      // If we have a currentChatId, update the chat in Firebase
      if (currentChatId && user) {
        console.log('Updating chat in Firebase with ID:', currentChatId);
        try {
          // Include the system message in what we store
          const finalStoredMessages = conversationHistory.some(msg => msg.role === 'system') 
            ? [...conversationHistory, assistantMessage] 
            : [
                {
                  role: "system",
                  content: "You are a helpful AI assistant focused on providing supplement recommendations and health advice based on the user's profile. Remember that all advice should be general in nature and users should consult healthcare professionals before making changes to their health regimen."
                },
                ...updatedMessages,
                assistantMessage
              ];
          
          await updateChatSession(currentChatId, finalStoredMessages);
          console.log('Chat updated successfully');
        } catch (err) {
          console.error('Error updating chat:', err);
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an issue generating a response. Please try again or contact support if the problem persists.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // If we have a currentChatId, update the chat in Firebase with the error message
      if (currentChatId && user) {
        try {
          // Need to check if we have a system message and include it
          let allMessages = [...updatedMessages, errorMessage];
          
          if (!allMessages.some(msg => msg.role === 'system')) {
            allMessages = [
              {
                role: "system",
                content: "You are a helpful AI assistant focused on providing supplement recommendations and health advice based on the user's profile. Remember that all advice should be general in nature and users should consult healthcare professionals before making changes to their health regimen."
              },
              ...allMessages
            ];
          }
          
          await updateChatSession(currentChatId, allMessages);
        } catch (err) {
          console.error('Error updating chat with error message:', err);
        }
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionnaireComplete = async () => {
    // Immediately hide questionnaire and show loading
    setLocalShowQuestionnaire(false);
    setLoading(true);
    onQuestionnaireComplete(); // Notify container to update its state immediately
    console.log("Questionnaire completed with data:", formData);
    
    try {
      // Create user profile summary from questionnaire data
      const userProfile = formatUserProfile(formData);
      console.log("Formatted user profile:", userProfile);
      
      // Initial system message that won't be displayed to the user
      const systemMessage = {
        role: 'system',
        content: SYSTEM_MESSAGE.content
      };
      
      // Create chat in Firebase first to have a valid chatId
      let newChatId;
      try {
        console.log("Creating new chat session from questionnaire");
        newChatId = await createChatSession(
          user.uid,
          `Health Consultation`,
          [systemMessage] // Initially just save the system message
        );
        setCurrentChatId(newChatId);
        
        // Notify parent component that chat is created to update URL
        onChatCreated(newChatId);
        console.log("New chat created with ID:", newChatId);
        
      } catch (error) {
        console.error('Error creating chat:', error);
        setError('Failed to create chat. Using local mode.');
      }
      
      // 1. First display the health profile summary
      const profileMessage = {
        role: 'assistant',
        content: userProfile
      };
      setMessages([profileMessage]);
      setLoading(false);
      
      // 2. After a moment, show welcome message
      const welcomeMessage = {
        role: 'assistant',
        content: WELCOME_MESSAGES.initial.text
      };
      
      // Wait a moment then add welcome message
      await sleep(500);
      setMessages(prev => [...prev, welcomeMessage]);
      
      // 3. After 2 seconds, show analyzing message
    await sleep(2000);
      const analyzingMessage = {
        role: 'assistant',
        content: WELCOME_MESSAGES.analyzing.text
      };
      setMessages(prev => [...prev, analyzingMessage]);
      
      // 4. After 3 more seconds, get AI response
      await sleep(3000);
      
      // Set up the user's profile information for the AI
      const healthProfilePrompt = formatUserProfile(formData);
      
      // Create a system message with user's profile data
      const enhancedSystemMessage = {
        ...systemMessage,
        content: systemMessage.content + "\n\n" + healthProfilePrompt
      };
      
      // API messages include enhanced system message but no user query
      const apiMessages = [enhancedSystemMessage];
      
      try {
        // Get AI response based only on the system message with profile information
        const aiResponse = await makeOpenAIRequest(apiMessages);
        
        // Add the AI response
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        
        // Save all messages to Firebase
        const messagesForStorage = [
          systemMessage, 
          profileMessage, 
          welcomeMessage,
          analyzingMessage, 
          { role: 'assistant', content: aiResponse }
        ];
        
        if (newChatId) {
          try {
            await updateChatSession(newChatId, messagesForStorage);
            console.log("Chat session updated with all messages");
            // Trigger storage event to update sidebar
            window.dispatchEvent(new Event('storage'));
          } catch (error) {
            console.error('Error updating chat with AI response:', error);
          }
        }
        
    } catch (error) {
      console.error('Error getting AI response:', error);
      
        // Add error message
        setMessages(prev => [...prev, {
          role: 'assistant', 
          content: 'Sorry, I was unable to generate a response. Please try again.',
          isError: true
        }]);
        
        if (newChatId) {
          try {
            await updateChatSession(newChatId, [
              systemMessage,
              profileMessage,
              welcomeMessage,
              analyzingMessage,
              { 
                role: 'assistant', 
                content: 'Sorry, I was unable to generate a response. Please try again.',
                isError: true 
              }
            ]);
          } catch (storageError) {
            console.error('Error updating chat with error message:', storageError);
          }
        }
      }
    } catch (error) {
      console.error('Error in questionnaire completion:', error);
      setError('An error occurred while processing your information.');
      setLoading(false);
    }
  };

  // Add this helper function
  const formatUserProfile = (data) => {
    if (!data) return '';

    // Add emoji icons to categories
    const formattedInfo = `**🧑‍💼 BASIC INFORMATION**
• Age: ${data.age}
• Sex: ${data.sex}
• Height: ${data.height}cm
• Weight: ${data.weight}kg

**🍽️ LIFESTYLE & DIET**
• Activity: ${data.activityLevel || 'Not specified'}
• Diet: ${data.dietType || 'Not specified'}
• Restrictions: ${data.dietaryRestrictions?.length ? data.dietaryRestrictions.join(', ') : 'None'}

**🩺 HEALTH STATUS**
• Concerns: ${data.healthConcerns?.length ? data.healthConcerns.join(', ') : 'None'}
• Medical: ${data.medicalConditions?.length ? data.medicalConditions.join(', ') : 'None'}
• Medications: ${data.medications?.length ? data.medications.join(', ') : 'None'}

**💊 CURRENT SUPPLEMENTS**
• Current: ${data.currentSupplements?.length ? data.currentSupplements.join(', ') : 'None'}
• Goals: ${data.supplementGoals?.length ? data.supplementGoals.join(', ') : 'None'}`;

    return formattedInfo;
  };

  // Update the formatAIMessage function
  const formatAIMessage = (text) => {
    // Split into sections by double newlines
    const sections = text.split('\n\n').filter(Boolean);
    
    return sections.map((section, index) => {
      // Check if text is wrapped in bold markers
      if (section.startsWith('**') && section.endsWith('**')) {
        return (
          <p key={index} className="font-bold mb-2 text-gray-900 dark:text-white">
            {section.replace(/^\*\*|\*\*$/g, '')}
          </p>
        );
      }
      
      // Check if it's a list/bullet points
      if (section.includes('\n-') || section.includes('\n•')) {
        const [title, ...items] = section.split('\n').filter(Boolean);
        return (
          <div key={index} className="space-y-2">
            {title && <p className="font-semibold text-gray-900 dark:text-white">{title}</p>}
            <ul className="space-y-1.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-sky-500 mt-1">•</span>
                  <span className="text-gray-800 dark:text-gray-200">{item.replace(/^[-•]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      }
      
      // Check if it's a supplement recommendation
      if (section.toLowerCase().includes('supplement') || section.includes(':')) {
        const [title, ...details] = section.split('\n');
        return (
          <div key={index} className="space-y-2">
            <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
            <div className="pl-4 space-y-1">
              {details.map((detail, i) => (
                <p key={i} className="flex items-start space-x-2">
                  {detail.includes(':') ? (
                    <>
                      <span className="text-sky-500">•</span>
                      <span className="text-gray-800 dark:text-gray-200">
                        <span className="font-medium">{detail.split(':')[0]}:</span>
                        {detail.split(':')[1]}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-800 dark:text-gray-200">{detail}</span>
                  )}
                </p>
              ))}
            </div>
          </div>
        );
      }

      // Regular paragraph
      return <p key={index} className="mb-4 text-gray-800 dark:text-gray-200">{styleVitaminNames(section)}</p>;
    });
  };

  // Add this helper function near the top of the file
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReaction = (messageIndex, reaction) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageIndex]: reaction
    }));
  };

  const copyToClipboard = async (text, messageIndex) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageIndex);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Add this constant at the top of the file
  const MAX_MESSAGE_LENGTH = 500;

  // Save messages to Firebase when they change
  useEffect(() => {
    const saveMessages = async () => {
      if (!currentChatId || !user || messages.length <= 1) return;
      
      try {
        // Ensure we have a system message at the beginning for the OpenAI API
        let messagesToSave = [...messages];
        
        // If there's no system message, add one
        if (!messagesToSave.some(msg => msg.role === 'system')) {
          messagesToSave = [
            {
              role: 'system',
              content: 'You are a helpful AI assistant focused on providing supplement recommendations and health advice based on the user\'s profile. Remember that all advice should be general in nature and users should consult healthcare professionals before making changes to their health regimen.'
            },
            ...messagesToSave
          ];
        }
        
        await updateChatSession(currentChatId, messagesToSave);
      } catch (err) {
        console.error('Error saving messages:', err);
      }
    };

    saveMessages();
  }, [messages, currentChatId, user]);

  // Update chat title after first user message
  useEffect(() => {
    const updateChatTitle = async () => {
      if (!currentChatId || !user) return;
      
      // Find the first user message
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (!firstUserMessage) return;
      
      // Generate a title from the first user message
      const title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
      
      try {
        await updateChatSession(currentChatId, messages, title);
      } catch (err) {
        console.error('Error updating chat title:', err);
      }
    };

    updateChatTitle();
  }, [messages, currentChatId, user]);

  // Update currentChatId when prop changes
  useEffect(() => {
    if (initialChatId !== currentChatId) {
      setCurrentChatId(initialChatId);
    }
  }, [initialChatId, currentChatId]);

  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    // Store that user has seen the disclaimer in this session
    localStorage.setItem('swallow_hero_seen_disclaimer', 'true');
    
    if (showWelcome) {
      setShowWelcome(true);
    }
  };

  // Get theme context at the component level
  const { profileTheme, getThemeGradient } = useTheme();

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2 transition-colors duration-200">Error</h3>
          <p className="text-gray-700 dark:text-gray-300 transition-colors duration-200">{error}</p>
        </div>
      </div>
    );
  }

  if (showDisclaimer) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-xl transition-colors duration-200">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">🚨Important Note</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 transition-colors duration-200">
            Our AI provides general recommendations based on available information. 
            Always consult with a healthcare professional before starting any new supplement regimen.
          </p>
          <button 
            onClick={handleDisclaimerAccept}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg py-3 transition-colors duration-200"
          >
            I Understand
          </button>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-950 dark:to-emerald-950 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="max-w-lg w-full p-8 shadow-xl rounded-2xl card bg-white dark:bg-gray-800 transition-colors duration-200"
          style={{ 
            isolation: 'isolate',
            position: 'relative',
            zIndex: 1,
            backgroundImage: 'none !important',
            backdropFilter: 'none !important',
            WebkitBackdropFilter: 'none !important'
          }}
        >
          <div className="text-center relative z-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Welcome to Swallow Hero</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-4 mb-8 transition-colors duration-200">
              Answer 10 short questions and live better!
            </p>
            <div className="space-y-6 mb-16">
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                  <span className="text-sky-600 dark:text-sky-400 text-lg transition-colors duration-200">1</span>
                </div>
                <p className="text-left">Complete a quick health profile</p>
              </div>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                  <span className="text-teal-600 dark:text-teal-400 text-lg transition-colors duration-200">2</span>
                </div>
                <p className="text-left">Get personalized supplement recommendations</p>
              </div>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                  <span className="text-emerald-600 dark:text-emerald-400 text-lg transition-colors duration-200">3</span>
                </div>
                <p className="text-left">Chat with AI for ongoing support</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setShowWelcome(false);
              }}
              className="btn-primary btn-lg"
            >
              Get Started
              <svg className="w-5 h-5 icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (localShowQuestionnaire) {
    const currentStepData = QUESTIONNAIRE_STEPS[currentStep];
    return (
      <div className="fixed inset-0 top-16 flex flex-col bg-transparent">
        <div className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 flex-none bg-transparent">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center transition-colors duration-200">Health Profile Questionnaire</h1>
        </div>

        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex-none bg-transparent">
          <div className="flex justify-between mb-1">
            {QUESTIONNAIRE_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-1.5 mx-0.5 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? 'bg-sky-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
            Step {currentStep + 1} of {QUESTIONNAIRE_STEPS.length}
          </p>
        </div>

        <div className="flex-1 overflow-hidden bg-transparent">
          <div className="h-full overflow-y-auto px-4 py-4">
            <div className="max-w-2xl mx-auto">
              <div className="card p-8 shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200 relative rounded-xl overflow-hidden">
                <div className="relative z-2">
                  <QuestionnaireStep
                    step={currentStepData}
                    formData={formData}
                    onChange={handleFormChange}
                    onNext={() => {
                      if (currentStep === QUESTIONNAIRE_STEPS.length - 1) {
                        handleQuestionnaireComplete();
                      } else {
                        setCurrentStep(prev => prev + 1);
                      }
                    }}
                    onBack={currentStep > 0 ? () => setCurrentStep(prev => prev - 1) : null}
                    isLastStep={currentStep === QUESTIONNAIRE_STEPS.length - 1}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Creating your personalized chat...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Add horizontal health profile if it exists */}
          {messages.some(msg => msg.role === 'assistant' && msg.content.includes('BASIC INFORMATION')) && (
            <HorizontalHealthProfile profileData={messages} />
          )}
          
          <div className="flex-1 min-h-0 w-full">
        <div className="h-full overflow-y-auto bg-transparent">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-xl px-4 card p-8 shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200">
                    <h2 className="text-xl font-bold hero-gradient mb-4">
                      Let's start a new conversation!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Ask me anything about supplements and health based on your profile.
                    </p>
              </div>
            </div>
          ) : (
                <div className="h-full w-full">
              <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
                    {messages
                      .filter(msg => msg.role !== 'system')
                      // Filter out the health profile summary from the chat messages since it's shown at the top
                      .filter(msg => !(msg.role === 'assistant' && msg.content.includes('BASIC INFORMATION')))
                      .map((message, index) => (
                  <div
                    key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[75%] ${message.isLoading ? 'animate-pulse' : ''}`}>
                          <div
                            className={`relative group ${
                              message.role === 'user'
                                ? 'rounded-tr-none rounded-2xl bg-gradient-to-r from-teal-500/70 to-sky-500/70 dark:from-teal-600/80 dark:to-sky-600/80 text-white shadow-sm px-4 py-3'
                                : 'rounded-tl-none rounded-2xl bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/30 px-4 py-3 pb-4'
                            }`}
                          >
                            {message.role === 'assistant' ? (
                              <div className="space-y-2">
                                {formatMessageContent(message.content, profileTheme, getThemeGradient)}
                              </div>
                            ) : (
                              <p className="text-white">{message.content}</p>
                            )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] sm:max-w-[75%]">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors duration-200 flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-md transition-colors duration-200 w-full">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isTyping}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 hover:from-sky-600 hover:via-teal-600 hover:to-green-600 text-white rounded-lg p-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface; 