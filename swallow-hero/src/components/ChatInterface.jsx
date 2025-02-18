import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

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
      { name: 'age', label: 'Age', type: 'number', required: true },
      { name: 'sex', label: 'Sex', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'height', label: 'Height (cm)', type: 'number', required: true },
      { name: 'weight', label: 'Weight (kg)', type: 'number', required: true },
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
        options: ['Balanced', 'Inconsistent','Vegan/Vegetarian', 'Pescatarian', 'Keto', 'Other'],
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
        label: 'Current Health Concerns', 
        type: 'multiselect',
        options: ['Energy Levels', 'Sleep Quality', 'Joint Health', 'Digestive Issues', 'Immune Support', 'Stress Management', 'Other'],
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
        label: 'Current Medications', 
        type: 'text',
        placeholder: 'List any medications you take',
        required: false 
      },
    ]
  },
  {
    id: 'supplements',
    title: 'Current Supplements',
    fields: [
      { 
        name: 'currentSupplements', 
        label: 'Current Supplements', 
        type: 'text',
        placeholder: 'List any supplements you currently take',
        required: false 
      },
      { 
        name: 'supplementGoals', 
        label: 'What are your main goals for taking supplements?', 
        type: 'multiselect',
        options: ['General Health', 'Energy', 'Immunity', 'Sleep', 'Joint Health', 'Muscle Building', 'Weight Management', 'Other'],
        required: true 
      },
    ]
  }
];

const QuestionnaireStep = ({ step, formData, onChange, onNext, onBack, isLastStep }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
        if (field.name === 'height' && (num < 50 || num > 300)) {
          newErrors[field.name] = 'Please enter a valid height between 50cm and 300cm';
        }
        if (field.name === 'weight' && (num < 30 || num > 300)) {
          newErrors[field.name] = 'Please enter a valid weight between 30kg and 300kg';
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

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:shadow-xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{step.title}</h2>
      <p className="text-gray-600 mb-6">Please fill in the following information to help us provide better recommendations.</p>
      
      <div className="space-y-6">
        {step.fields.map(field => (
          <div key={field.name} className="space-y-2 transition-all duration-300">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'select' ? (
              <div className="relative">
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  onFocus={() => handleFieldFocus(field.name)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 transition-all duration-200
                    ${errors[field.name] && touched[field.name] ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-sky-200'}
                    ${formData[field.name] ? 'border-green-200' : ''}
                    appearance-none bg-white`}
                >
                  <option value="">Select {field.label.toLowerCase()}...</option>
                  {field.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            ) : field.type === 'multiselect' ? (
              <div className="space-y-2 p-3 border rounded-lg bg-white">
                {field.options.map(option => (
                  <label key={option} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors duration-150">
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
                      className="w-4 h-4 rounded text-sky-500 focus:ring-sky-200 transition-all duration-200"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type={field.type}
                value={formData[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                onFocus={() => handleFieldFocus(field.name)}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                className={`w-full p-3 border rounded-lg focus:ring-2 transition-all duration-200
                  ${errors[field.name] && touched[field.name] ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-sky-200'}
                  ${formData[field.name] && !errors[field.name] ? 'border-green-200' : ''}`}
              />
            )}
            
            {errors[field.name] && touched[field.name] && (
              <p className="text-sm text-red-500 mt-1 animate-fadeIn">
                {errors[field.name]}
              </p>
            )}
            
            {field.description && (
              <p className="text-sm text-gray-500 mt-1">
                {field.description}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className={`px-6 py-3 text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-all duration-200
            ${!onBack ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 
            transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
        >
          <span>{isLastStep ? 'Start Chat' : 'Next'}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);
  const [formData, setFormData] = useState({});
  const messagesEndRef = useRef(null);
  
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

  // System message to constrain AI behavior
  const systemMessage = {
    role: "system",
    content: `You are Swallow Hero, a professional vitamin and supplement advisor with expertise in nutrition and supplementation. Your purpose is to provide personalized vitamin and supplement recommendations based on individual health profiles.

    CORE RESPONSIBILITIES:
    1. Information Processing - Process the user's health profile based on their initial submission

    CONVERSATION GUIDELINES:
    1. Start by introducing yourself and asking about their primary health goals
    2. Ask questions one at a time to avoid overwhelming the user
    3. Acknowledge and validate their concerns
    4. Use a friendly, professional tone
    5. If information is missing, politely ask follow-up questions

    RECOMMENDATION PROTOCOL:
    1. Base all recommendations on scientific evidence
    2. Consider potential interactions with:
       - Existing medications
       - Other supplements
       - Medical conditions
    3. Provide specific dosage recommendations when appropriate
    4. Explain the benefits and function of each recommended supplement
    5. Suggest both essential and optional supplements
    6. Prioritize recommendations based on user's main health goals

    SAFETY PROTOCOLS:
    1. Include these safety disclaimers with recommendations:
       - Consult healthcare provider before starting any supplement regimen
       - Potential interactions with medications
       - Proper storage and usage instructions
    2. Never diagnose medical conditions
    3. Redirect medical diagnosis questions to healthcare providers
    4. Emphasize that supplements complement but don't replace a balanced diet

    BOUNDARIES:
    1. Stay focused on vitamin and supplement topics
    2. Do not provide medical diagnosis or treatment advice
    3. Do not recommend supplements for serious medical conditions
    4. Politely redirect off-topic questions back to vitamin and supplement discussion
    5. If a question is beyond your scope, recommend consulting a healthcare provider

    RESPONSE STRUCTURE:
    1. Keep responses clear and concise
    2. Break down complex information into digestible parts
    3. Use bullet points for lists of recommendations
    4. Include brief explanations for each recommendation
    5. End with relevant safety disclaimers

    Start by introducing yourself and asking about their primary health goals and concerns.`
  };

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
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.3, // Slight penalty for repetition
        frequency_penalty: 0.3, // Slight penalty for frequent tokens
        top_p: 0.9, // Nucleus sampling
      });

      return completion;
    } catch (error) {
      if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
        console.log(`Rate limited, retrying in ${RETRY_DELAY}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await sleep(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
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
        systemMessage,
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
    // Format collected data for the AI in a more readable way
    const userProfile = [
      "MY HEALTH PROFILE",
      "----------------------------------------",
      "",
      "BASIC INFORMATION",
      `Age: ${formData.age}`,
      `Sex: ${formData.sex}`,
      `Height: ${formData.height}cm`,
      `Weight: ${formData.weight}kg`,
      "",
      "LIFESTYLE & DIET",
      `Activity Level: ${formData.activityLevel}`,
      `Diet Type: ${formData.dietType}`,
      `Dietary Restrictions: ${formData.dietaryRestrictions?.join(', ') || 'None'}`,
      "",
      "HEALTH INFORMATION",
      `Health Concerns: ${formData.healthConcerns?.join(', ')}`,
      `Medical Conditions: ${formData.medicalConditions || 'None reported'}`,
      `Current Medications: ${formData.medications || 'None reported'}`,
      "",
      "SUPPLEMENT INFORMATION",
      `Current Supplements: ${formData.currentSupplements || 'None reported'}`,
      `Supplement Goals: ${formData.supplementGoals?.join(', ')}`,
      "",
      "Please provide personalized supplement recommendations based on my profile."
    ].join('\n');

    // Add initial message with user profile
    const initialMessage = {
      text: userProfile,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    // Add welcome message from AI
    const welcomeMessage = {
      text: "👋 Hello! I'm analyzing your health profile to create personalized supplement recommendations for you. One moment please...",
      sender: 'ai',
      timestamp: new Date().toISOString(),
    };

    setMessages([initialMessage, welcomeMessage]);
    setShowQuestionnaire(false);
    setIsTyping(true);

    // Update system message to ensure cleaner responses
    const updatedSystemMessage = {
      role: "system",
      content: `You are Swallow Hero, a professional vitamin and supplement advisor. Provide clear, concise supplement recommendations.

RESPONSE FORMAT:
1. Keep responses organized and easy to read
2. Don't use markdown characters (no * or #)
3. Use clear sections with CAPS for headers
4. For supplement recommendations, use this format:

RECOMMENDED SUPPLEMENTS:

[Supplement Name]
- Purpose: [Brief purpose]
- Dosage: [Clear dosage]

IMPORTANT NOTES:
- Always include brief safety disclaimer at the end
- Avoid unnecessary introductions or filler text
- Focus on clear, actionable recommendations
- Use simple formatting without special characters`
    };

    try {
      // Prepare conversation history with the questionnaire data
      const conversationHistory = [
        updatedSystemMessage,
        { role: 'user', content: userProfile }
      ];

      // Get AI response
      const completion = await makeOpenAIRequest(conversationHistory);

      if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] sm:h-[700px]">
        <div className="text-center p-8 bg-red-50 rounded-lg">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Note</h2>
          <p className="text-gray-600 text-lg mb-6">
            Our AI provides general recommendations based on available information. 
            Always consult with a healthcare professional before starting any new supplement regimen.
          </p>
          <button 
            onClick={() => setShowDisclaimer(false)}
            className="w-full btn-primary py-3"
          >
            I Agree
          </button>
        </div>
      </div>
    );
  }

  if (showQuestionnaire) {
    const currentStepData = QUESTIONNAIRE_STEPS[currentStep];
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {QUESTIONNAIRE_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex-1 h-2 mx-1 rounded-full ${
                    index <= currentStep ? 'bg-sky-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              Step {currentStep + 1} of {QUESTIONNAIRE_STEPS.length}
            </p>
          </div>
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
    );
  }

  return (
    <div className="flex flex-col h-[600px] sm:h-[700px] relative bg-gradient-to-b from-white to-gray-50 rounded-xl">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 px-4">
            <p className="text-xl mb-4 font-semibold">👋 Welcome to Swallow Hero AI Chat!</p>
            <p className="text-lg mb-3">Start by telling me about your health goals and any specific concerns.</p>
            <p className="text-base text-gray-400">For example:</p>
            <div className="space-y-2 mt-2 text-gray-600">
              <p>"I want to improve my energy levels"</p>
              <p>"What supplements are good for joint health?"</p>
              <p>"I need help with my sleep quality"</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-tr-none shadow-sm'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-gray-500 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl">
        <form onSubmit={handleSubmit} className="relative" noValidate>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (inputMessage.trim()) {
                  handleSubmit(e);
                }
              }
            }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-sky-500 hover:text-sky-600 disabled:text-gray-300 disabled:hover:text-gray-300 transition-colors duration-200"
            disabled={!inputMessage.trim()}
          >
            <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface; 