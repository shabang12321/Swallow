// Chat Interface Constants
export const CHAT_CONSTANTS = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  MAX_MESSAGE_LENGTH: 500,
};

// Questionnaire Configuration
export const QUESTIONNAIRE_STEPS = [
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
  }
];

// Validation Constants
export const VALIDATION_RULES = {
  age: {
    min: 18,
    max: 120,
  },
  height: {
    min: 50,
    max: 300,
  },
  weight: {
    min: 20,
    max: 500,
  },
  phoneNumber: {
    pattern: /^\+?[\d\s-]{10,}$/,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  required: field => `${field} is required`,
  invalidAge: 'Please enter a valid age between 18 and 120',
  invalidHeight: 'Please enter a valid height (50-300 cm)',
  invalidWeight: 'Please enter a valid weight (20-500 kg)',
  invalidPhone: 'Please enter a valid phone number',
  networkError: 'Network error. Please check your connection.',
  serverError: 'Server error. Please try again later.',
  authError: 'Authentication error. Please log in again.',
};

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Firebase Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats',
  HEALTH_PROFILES: 'healthProfiles',
  USER_ACTIVITY: 'userActivity',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'userProfile',
  AUTH_TOKEN: 'authToken',
  THEME: 'theme',
  LANGUAGE: 'language',
}; 