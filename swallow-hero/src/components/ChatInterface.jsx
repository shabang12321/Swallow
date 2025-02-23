import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../contexts/ThemeContext';

// Message formatting components
const BoldText = ({ text }) => {
  const { profileTheme, getThemeGradient } = useTheme();
  return (
    <div className={`inline-block font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${getThemeGradient(profileTheme)}`} 
      style={{ 
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '1.125rem',
        lineHeight: '1.75rem',
        fontWeight: 700
      }}>
      {text.replace(/^\*\*|\*\*$/g, '')}
    </div>
  );
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

const formatMessageContent = (content) => {
  const sections = content.split('\n\n').filter(Boolean);
  
  return sections.map((section, index) => {
    // Main headers and supplement names (keep theme gradient)
    if (section.startsWith('**') && section.endsWith('**')) {
      return <BoldText key={index} text={section} />;
    }
    
    // Supplement info with bold text handling
    if (section.includes('**')) {
      const lines = section.split('\n');
      return (
        <div key={index} className="space-y-2">
          {lines.map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return <BoldText key={i} text={line} />;
            }
            if (line.includes('**')) {
              // Handle Purpose and Dosage as regular bold text
              const parts = line.split(/\*\*(.*?)\*\*/);
              return (
                <p key={i} className="flex items-start space-x-2">
                  <span className="text-sky-500">•</span>
                  <span>
                    <span className="font-bold">{parts[1]}</span>
                    {parts[2]}
                  </span>
                </p>
              );
            }
            return <p key={i}>{line}</p>;
          })}
        </div>
      );
    }
    
    // Regular paragraph
    return <p key={index} className="mb-2">{section}</p>;
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

  const validateStep = () => {
    const newErrors = {};
    step.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = 'This field is required';
      }
      if (field.type === 'number' && formData[field.name]) {
        const num = Number(formData[field.name]);
        if (field.name === 'age' && (num < 18 || num > 120)) {
          newErrors[field.name] = 'Please enter a valid age between 18 and 120';
        }
        if (field.name === 'height' && num < 0) {
          newErrors[field.name] = 'Height cannot be negative';
        }
        if (field.name === 'weight' && num < 0) {
          newErrors[field.name] = 'Weight cannot be negative';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    }
  };

  const handleFieldFocus = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const renderField = (field) => {
    const value = formData[field.name] !== undefined ? formData[field.name] : field.defaultValue;
    const error = touched[field.name] && errors[field.name];

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
                onChange={(e) => onChange(field.name, e.target.value)}
                onFocus={() => handleFieldFocus(field.name)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              {field.allowCustomInput && !showCustomInput[field.name] ? (
                <button
                  onClick={() => {
                    setShowCustomInput(prev => ({ ...prev, [field.name]: true }));
                    onChange(field.name, value);
                  }}
                  className="w-20 px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:border-sky-500 transition-colors text-center"
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
                    onChange(field.name, newValue.toString());
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
                      onChange(field.name, field.defaultValue.toString());
                    }
                    setShowCustomInput(prev => ({ ...prev, [field.name]: false }));
                  }}
                  className="w-20 px-3 py-1 text-sm border border-gray-200 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-200 text-center"
                  autoFocus
                />
              ) : (
                <span className="w-20 text-center text-sm text-gray-600">
                  {value} {field.name === 'height' ? 'cm' : 'kg'}
                </span>
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
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
              onChange={(e) => onChange(field.name, e.target.value)}
              onFocus={() => handleFieldFocus(field.name)}
              className={`w-full p-2 border rounded-md focus:ring-1 transition-all duration-200
                ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-sky-200'}
                ${value ? 'border-green-200' : ''}
                appearance-none bg-white`}
            >
              <option value="">Select {field.label.toLowerCase()}...</option>
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-1 p-2 border rounded-md bg-white">
            {field.options.map(option => (
              <label key={option} className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded transition-colors duration-150">
                <input
                  type="checkbox"
                  checked={formData[field.name]?.includes(option) || false}
                  onChange={(e) => {
                    const current = formData[field.name] || [];
                    const value = e.target.checked
                      ? [...current, option]
                      : current.filter(item => item !== option);
                    onChange(field.name, value);
                    handleFieldFocus(field.name);
                  }}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-1 focus:ring-sky-200 transition-all duration-200"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio-group':
        return (
          <div className="flex justify-between items-center space-x-4">
            {field.options.map(option => (
              <label
                key={option}
                className={`flex-1 text-center p-2 border rounded-lg cursor-pointer transition-all duration-200
                  ${value === option 
                    ? 'bg-sky-500 text-white border-sky-500' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-sky-500'}`}
              >
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(field.name, e.target.value)}
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
            onChange={(e) => onChange(field.name, e.target.value)}
            onFocus={() => handleFieldFocus(field.name)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={`w-full p-2 border rounded-md focus:ring-1 transition-all duration-200
              ${error && touched[field.name] ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-sky-200'}
              ${value && !error ? 'border-green-200' : ''}`}
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100"
      style={{ 
        backgroundColor: '#FFFFFF',
        isolation: 'isolate',
        position: 'relative',
        zIndex: 1,
        backgroundImage: 'none !important',
        backdropFilter: 'none !important',
        WebkitBackdropFilter: 'none !important'
      }}
    >
      <div 
        style={{
          content: '""',
          position: 'absolute',
          inset: 0,
          background: '#FFFFFF',
          zIndex: -1,
          borderRadius: '1rem'
        }}
      />
      <div className="p-4 relative z-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h2>
        <p className="text-sm text-gray-600 mb-4">Please fill in the following information.</p>
        
        <div className="space-y-6">
          {step.fields.map(field => (
            <div key={field.name} className="space-y-2">
              <label className="block text-base font-semibold text-gray-800">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {renderField(field)}
              
              {errors[field.name] && touched[field.name] && (
                <p className="text-xs text-red-500">
                  {errors[field.name]}
                </p>
              )}
              
              {field.description && (
                <p className="text-xs text-gray-500">
                  {field.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className={`btn-outline btn-sm text-gray-600 ${!onBack ? 'opacity-0 pointer-events-none' : ''}`}
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

**Recommended Supplements:**

**[Supplement Name]**
- **Purpose:** [Brief purpose]
- **Dosage:** [Clear dosage]

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
    text: "**Analyzing Your Profile**\n\nI'm analysing your health profile to create personalised supplement recommendations for you. One moment please...",
    sender: 'ai'
  }
};

const SYSTEM_MESSAGE = {
  role: "system",
  content: `You are Swallow Hero, a professional vitamin and supplement advisor. You MUST format EVERY response, including your first response, using this exact structure:

FIRST RESPONSE FORMAT:
When first analyzing a health profile, respond with:

**Personalized Supplement Analysis**

**Recommended Supplements:**

**[Supplement Name]**
- **Purpose:** [Brief purpose]
- **Dosage:** [Clear dosage]

[Repeat for each supplement]

**Important Notes:**
- [Safety disclaimers]
- [Additional specific notes]

SUBSEQUENT RESPONSES:
For all other responses, use the same structure.

RULES:
- EVERY response must use bold headers
- EVERY supplement name must be bold
- EVERY "Purpose:" and "Dosage:" must be bold
- Never deviate from this format`
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);
  const [formData, setFormData] = useState({});
  const messagesEndRef = useRef(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
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

      return completion;
    } catch (error) {
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
    const newMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Prepare conversation history
      const conversationHistory = [
        SYSTEM_MESSAGE,
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: inputMessage }
      ];

      console.log('Attempting to send request to OpenAI...');

      // Get AI response with retry logic
      const completion = await makeOpenAIRequest(conversationHistory);

      console.log('Successfully received response from OpenAI');

      if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
        console.error('Invalid response structure:', completion);
        throw new Error('Invalid response format from OpenAI');
      }

      const aiResponse = {
        text: completion.choices[0].message.content,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Detailed error from OpenAI:', {
        error: error,
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      
      let errorMessage = "I apologize, but I'm having trouble processing your request.";
      
      if (error.response?.status === 429) {
        errorMessage = "I apologize, but we've reached our current usage limit. Please try again in a few moments.";
      } else if (error.response) {
        errorMessage += ` Error: ${error.response.data?.error?.message || error.message || 'Unknown API error'}`;
      } else if (error.message) {
        errorMessage += ` Error: ${error.message}`;
      }

      setMessages(prev => [...prev, {
        text: errorMessage,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionnaireComplete = async () => {
    const initialMessage = {
      text: formatUserProfile(formData),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const welcomeMessage1 = {
      ...WELCOME_MESSAGES.initial,
      timestamp: new Date().toISOString(),
    };

    setMessages([initialMessage, welcomeMessage1]);
    setShowQuestionnaire(false);
    setIsTyping(true);

    await sleep(2000);

    const welcomeMessage2 = {
      ...WELCOME_MESSAGES.analyzing,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, welcomeMessage2]);

    try {
      const conversationHistory = [
        SYSTEM_MESSAGE,
        {
          role: "system",
          content: ANALYSIS_FORMAT_TEMPLATE
        },
        {
          role: 'user',
          content: initialMessage.text
        }
      ];

      await sleep(2000);

      const completion = await makeOpenAIRequest(conversationHistory);

      if (!completion.choices?.[0]?.message) {
        throw new Error('Invalid response format from OpenAI');
      }

      const aiResponse = {
        text: completion.choices[0].message.content,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        text: "I apologize, but I'm having trouble processing your information. Please try sending your question again.",
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Add this helper function
  const formatUserProfile = (data) => {
    return `🔍 Health Profile Summary

👤 Basic Information 
    • Age: ${data.age}
    • Sex: ${data.sex}
    • Height: ${data.height}cm
    • Weight: ${data.weight}kg

💪 Lifestyle & Diet 
    • Activity: ${data.activityLevel}
    • Diet: ${data.dietType}
    ${data.dietaryRestrictions?.length ? `• Restrictions: ${data.dietaryRestrictions.join(', ')}` : '• Restrictions: None'}

❤️ Health Status 
    • Concerns: ${data.healthConcerns.join(', ')}
    ${data.medicalConditions ? `• Medical: ${data.medicalConditions}` : '• Medical: None'}
    ${data.medications ? `• Medications: ${data.medications}` : '• Medications: None'}

💊 Current Supplements 
    • Current: ${data.currentSupplements || 'None'}
    ${data.supplementGoals?.length ? `• Goals: ${data.supplementGoals.join(', ')}` : '• Goals: None'}`;
  };

  // Update the formatAIMessage function
  const formatAIMessage = (text) => {
    // Split into sections by double newlines
    const sections = text.split('\n\n').filter(Boolean);
    
    return sections.map((section, index) => {
      // Check if text is wrapped in bold markers
      if (section.startsWith('**') && section.endsWith('**')) {
        return (
          <p key={index} className="font-bold mb-2">
            {section.replace(/^\*\*|\*\*$/g, '')}
          </p>
        );
      }
      
      // Check if it's a list/bullet points
      if (section.includes('\n-') || section.includes('\n•')) {
        const [title, ...items] = section.split('\n').filter(Boolean);
        return (
          <div key={index} className="space-y-2">
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
      }
      
      // Check if it's a supplement recommendation
      if (section.toLowerCase().includes('supplement') || section.includes(':')) {
        const [title, ...details] = section.split('\n');
        return (
          <div key={index} className="space-y-2">
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
      }

      // Regular paragraph
      return <p key={index} className="mb-2">{section}</p>;
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

  if (showWelcome) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-sky-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full p-8 shadow-xl rounded-2xl card"
          style={{ 
            backgroundColor: '#FFFFFF',
            isolation: 'isolate',
            position: 'relative',
            zIndex: 1,
            backgroundImage: 'none !important',
            backdropFilter: 'none !important',
            WebkitBackdropFilter: 'none !important'
          }}
        >
          <div 
            style={{
              content: '""',
              position: 'absolute',
              inset: 0,
              background: '#FFFFFF',
              zIndex: -1,
              borderRadius: '1rem'
            }}
          />
          <div className="text-center relative z-2">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-teal-500">
              Welcome to Swallow Hero AI
            </h1>
            <p className="text-xl text-gray-600 mt-4 mb-8">
              Answer 10 short questions and live better!
            </p>
            <div className="space-y-6 mb-16">
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sky-600 text-lg">1</span>
                </div>
                <p className="text-left">Complete a quick health profile</p>
              </div>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 text-lg">2</span>
                </div>
                <p className="text-left">Get personalized supplement recommendations</p>
              </div>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 text-lg">3</span>
                </div>
                <p className="text-left">Chat with AI for ongoing support</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setShowWelcome(false);
                setShowDisclaimer(true);
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

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (showDisclaimer) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🚨Important Note</h2>
          <p className="text-gray-600 text-lg mb-6">
            Our AI provides general recommendations based on available information. 
            Always consult with a healthcare professional before starting any new supplement regimen.
          </p>
          <button 
            onClick={() => setShowDisclaimer(false)}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg py-3 transition-colors duration-200"
          >
            I Understand
          </button>
        </div>
      </div>
    );
  }

  if (showQuestionnaire) {
    const currentStepData = QUESTIONNAIRE_STEPS[currentStep];
    return (
      <div className="fixed inset-0 top-16 flex flex-col bg-transparent">
        <div className="py-3 px-4 border-b border-gray-200 flex-none bg-transparent">
          <h1 className="text-xl font-bold text-gray-900 text-center">Health Profile Questionnaire</h1>
        </div>

        <div className="px-4 py-2 border-b border-gray-100 flex-none bg-transparent">
          <div className="flex justify-between mb-1">
            {QUESTIONNAIRE_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-1.5 mx-0.5 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? 'bg-sky-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-xs text-gray-500">
            Step {currentStep + 1} of {QUESTIONNAIRE_STEPS.length}
          </p>
        </div>

        <div className="flex-1 overflow-hidden bg-transparent">
          <div className="h-full overflow-y-auto px-4 py-4">
            <div className="max-w-2xl mx-auto">
              <div className="card p-8 shadow-lg"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  isolation: 'isolate',
                  position: 'relative',
                  zIndex: 1,
                  backgroundImage: 'none !important',
                  backdropFilter: 'none !important',
                  WebkitBackdropFilter: 'none !important'
                }}
              >
                <div 
                  style={{
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: '#FFFFFF',
                    zIndex: -1,
                    borderRadius: '1rem'
                  }}
                />
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
    <div className="fixed inset-0 top-16 flex flex-col bg-transparent">
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto bg-transparent">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-xl px-4 card p-8 shadow-lg"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  isolation: 'isolate',
                  position: 'relative',
                  zIndex: 10,
                  backgroundImage: 'none !important',
                  backdropFilter: 'none !important',
                  WebkitBackdropFilter: 'none !important'
                }}
              >
                <div 
                  style={{
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: '#FFFFFF',
                    zIndex: -1,
                    borderRadius: '1rem'
                  }}
                />
                <div className="relative z-2">
                  <BoldText text="**Welcome to Swallow Hero AI**" />
                  <div className="space-y-4 text-gray-600">
                    <p>
                      I'm here to help you with personalized supplement recommendations and answer any questions about:
                    </p>
                    <ul className="space-y-2 text-left">
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Vitamin and supplement recommendations
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Dosage and timing guidance
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Potential interactions and safety
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        General nutrition advice
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[85%] sm:max-w-[75%]">
                      <div
                        className={`relative group rounded-2xl px-4 py-3 ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-tr-none'
                            : 'card text-gray-800 rounded-tl-none'
                        }`}
                        style={message.sender === 'ai' ? {
                          backgroundColor: '#FFFFFF',
                          isolation: 'isolate',
                          position: 'relative',
                          zIndex: 10,
                          backgroundImage: 'none !important',
                          backdropFilter: 'none !important',
                          WebkitBackdropFilter: 'none !important',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        } : {}}
                      >
                        {message.sender === 'ai' && (
                          <div 
                            style={{
                              content: '""',
                              position: 'absolute',
                              inset: 0,
                              background: '#FFFFFF',
                              zIndex: -1,
                              borderRadius: '1rem',
                              borderTopLeftRadius: 0
                            }}
                          />
                        )}
                        <div className="relative z-2">
                          {message.sender === 'ai' ? (
                            formatMessageContent(message.text)
                          ) : (
                            <pre className="font-sans whitespace-pre-wrap">{message.text}</pre>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white card rounded-2xl rounded-tl-none px-4 py-2.5"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        isolation: 'isolate',
                        position: 'relative',
                        zIndex: 1,
                        backgroundImage: 'none !important',
                        backdropFilter: 'none !important',
                        WebkitBackdropFilter: 'none !important'
                      }}
                    >
                      <div 
                        style={{
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          background: '#FFFFFF',
                          zIndex: -1,
                          borderRadius: '1rem',
                          borderTopLeftRadius: 0
                        }}
                      />
                      <div className="relative z-2 flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
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

      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <form onSubmit={handleSubmit} className="relative" noValidate>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => {
                if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                  setInputMessage(e.target.value);
                }
              }}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 pr-24 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputMessage.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
            />
            <div className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {inputMessage.length}/{MAX_MESSAGE_LENGTH}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 hover:from-sky-600 hover:via-teal-600 hover:to-green-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={!inputMessage.trim()}
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 