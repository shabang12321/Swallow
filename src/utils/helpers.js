import { ERROR_MESSAGES } from '../config/constants';

// Error handling utilities
export class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export const handleError = (error, defaultMessage = ERROR_MESSAGES.serverError) => {
  console.error('Error details:', {
    name: error.name,
    message: error.message,
    code: error.code,
    stack: error.stack,
    details: error.details
  });

  if (error instanceof AppError) {
    return error.message;
  }

  if (error.code === 'permission-denied') {
    return ERROR_MESSAGES.authError;
  }

  if (error.name === 'NetworkError' || !navigator.onLine) {
    return ERROR_MESSAGES.networkError;
  }

  return defaultMessage;
};

// Retry utility for API calls
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        continue;
      }
      
      throw error;
    }
  }

  throw lastError;
};

// Data formatting utilities
export const formatUserProfile = (data) => {
  const sections = [
    {
      title: '👤 Basic Information',
      items: [
        ['Age', data.age],
        ['Sex', data.sex],
        ['Height', `${data.height}cm`],
        ['Weight', `${data.weight}kg`],
      ]
    },
    {
      title: '💪 Lifestyle & Diet',
      items: [
        ['Activity', data.activityLevel],
        ['Diet', data.dietType],
        ['Restrictions', data.dietaryRestrictions?.length ? data.dietaryRestrictions.join(', ') : 'None'],
      ]
    },
    {
      title: '❤️ Health Status',
      items: [
        ['Concerns', data.healthConcerns.join(', ')],
        ['Medical', data.medicalConditions || 'None'],
        ['Medications', data.medications || 'None'],
      ]
    },
    {
      title: '💊 Current Supplements',
      items: [
        ['Current', data.currentSupplements || 'None'],
        ['Goals', data.supplementGoals?.length ? data.supplementGoals.join(', ') : 'None'],
      ]
    }
  ];

  return sections.map(section => {
    const items = section.items
      .map(([key, value]) => `    • ${key}: ${value}`)
      .join('\n');
    return `${section.title}\n${items}`;
  }).join('\n\n');
};

// Date formatting utilities
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(String(phone));
};

// Local storage utilities with error handling
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}; 