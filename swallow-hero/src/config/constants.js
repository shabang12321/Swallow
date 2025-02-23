export const QUESTIONNAIRE_STEPS = [
  {
    title: 'Personal Information',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'select',
        options: ['John Doe', 'Jane Smith'],
        required: true,
      },
      {
        name: 'age',
        label: 'Age',
        type: 'range',
        min: 18,
        max: 100,
        defaultValue: 25,
        unit: 'years',
        allowCustomInput: true,
        required: true,
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'radio-group',
        options: ['Male', 'Female', 'Other'],
        required: true,
      },
      {
        name: 'phoneNumber',
        label: 'Phone Number',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    title: 'Physical Information',
    fields: [
      {
        name: 'height',
        label: 'Height',
        type: 'range',
        min: 120,
        max: 220,
        defaultValue: 170,
        unit: 'cm',
        allowCustomInput: true,
        required: true,
      },
      {
        name: 'weight',
        label: 'Weight',
        type: 'range',
        min: 30,
        max: 200,
        defaultValue: 70,
        unit: 'kg',
        allowCustomInput: true,
        required: true,
      },
    ],
  },
  {
    title: 'Medical Information',
    fields: [
      {
        name: 'bloodType',
        label: 'Blood Type',
        type: 'select',
        options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
        required: true,
      },
      {
        name: 'allergies',
        label: 'Allergies',
        type: 'select',
        options: ['None', 'Pollen', 'Dust', 'Food', 'Other'],
        required: true,
      },
    ],
  },
];

// Firebase Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats',
  HEALTH_PROFILES: 'healthProfiles',
  USER_ACTIVITY: 'userActivity',
  QUESTIONNAIRES: 'questionnaires',
  NOTIFICATIONS: 'notifications'
};

// Validation Rules
export const VALIDATION_RULES = {
  age: {
    min: 18,
    max: 100,
  },
  height: {
    min: 120,
    max: 220,
  },
  weight: {
    min: 30,
    max: 200,
  },
  phoneNumber: {
    pattern: /^\+?[\d\s-]{10,}$/,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  required: (field) => `${field} is required`,
  invalidAge: 'Age must be between 18 and 100 years',
  invalidHeight: 'Height must be between 120 and 220 cm',
  invalidWeight: 'Weight must be between 30 and 200 kg',
  invalidPhone: 'Please enter a valid phone number',
  invalidEmail: 'Please enter a valid email address',
  passwordMismatch: 'Passwords do not match',
  weakPassword: 'Password must be at least 8 characters long',
  networkError: 'Network error. Please check your connection',
  unknownError: 'An unknown error occurred. Please try again',
}; 