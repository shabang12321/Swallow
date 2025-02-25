import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Prompt } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import debounce from 'lodash/debounce';
import { useTheme } from '../contexts/ThemeContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { setProfileTheme, getThemeGradient } = useTheme();
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    medicalConditions: '',
    allergies: '',
    phoneNumber: '',
    profileTheme: 'ocean',
  });
  const [notifications, setNotifications] = useState([]);
  const notificationDuration = 3000; // Increased from 1500ms to 3000ms for longer visibility

  const addNotification = useCallback((type, message) => {
    // Clear any existing notifications first
    setNotifications([]);
    const id = Date.now();
    setNotifications([{ id, type, message }]);
    
    // Only set timeout for success/error messages, not for saving state
    if (type !== 'saving') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, notificationDuration);
    }
  }, [notificationDuration]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [retryCount]);

  // Enable offline persistence
  useEffect(() => {
    const setupPersistence = async () => {
      try {
        await enableIndexedDbPersistence(db);
      } catch (err) {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser doesn\'t support offline persistence');
        }
      }
    };
    setupPersistence();
  }, []);

  const checkUser = async () => {
    console.log('Checking user profile...');
    try {
      if (!user) {
        if (!authLoading) {
          navigate('/');
        }
        return;
      }

      // Verify Firestore is initialized
      console.log('Firestore status:', {
        isDatabaseInitialized: !!db,
        projectId: db?.app?.options?.projectId
      });

      if (!db) {
        throw new Error('Database not properly configured. Please check your Firebase setup.');
      }

      // Check if profile already exists
      console.log('Fetching user document...');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      console.log('User document:', {
        exists: userDoc.exists(),
        data: userDoc.exists() ? userDoc.data() : null
      });

      if (userDoc.exists() && userDoc.data().profileCompleted) {
        navigate('/dashboard');
        return;
      }
      setLoading(false);
      setError(null);
    } catch (error) {
      let errorMessage = 'Unable to load profile. ';
      if (!db) {
        errorMessage += 'Database not configured.';
      } else if (isOffline) {
        errorMessage += 'You are currently offline.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
      setLoading(false);
      
      if (isOffline && retryCount < 3) {
        setRetryCount(prev => prev + 1);
      }
    }
  };

  // Validation rules
  const validateForm = (data) => {
    const errors = {};
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());

    if (!data.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (data.fullName.length < 2) {
      errors.fullName = 'Name must be at least 2 characters long';
    }

    if (!data.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(data.dateOfBirth);
      if (dob > maxDate) {
        errors.dateOfBirth = 'Must be at least 13 years old';
      } else if (dob < minDate) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    if (!data.gender) {
      errors.gender = 'Please select a gender';
    }

    if (data.height && (data.height < 50 || data.height > 300)) {
      errors.height = 'Please enter a valid height (50-300 cm)';
    }

    if (data.weight && (data.weight < 20 || data.weight > 500)) {
      errors.weight = 'Please enter a valid weight (20-500 kg)';
    }

    if (data.phoneNumber && !/^\+?[\d\s-]{10,}$/.test(data.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    return errors;
  };

  // Auto-save functionality
  const autoSave = useCallback(
    debounce(async (data) => {
      if (!user || Object.keys(validateForm(data)).length > 0) return;

      try {
        setSaving(true);
        addNotification('saving', 'Saving changes...');
        await setDoc(doc(db, 'users', user.uid), {
          ...data,
          email: user.email,
          updatedAt: new Date(),
        }, { merge: true });
        addNotification('success', 'Changes saved automatically');
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save error:', error);
        addNotification('error', 'Failed to save changes');
      } finally {
        setSaving(false);
      }
    }, 2000),
    [user, addNotification]
  );

  // Remove the effect that shows unsaved changes notification
  // Effect to show unsaved changes notification
  useEffect(() => {
    if (hasUnsavedChanges && !saving) {
      autoSave(formData);
    }
  }, [hasUnsavedChanges, saving, formData, autoSave]);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (!user) {
          if (!authLoading) {
            navigate('/');
          }
          return;
        }

        console.log('Loading user profile...');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('Profile data loaded:', data);
          setFormData(prev => ({
            ...prev,
            fullName: data.fullName || '',
            dateOfBirth: data.dateOfBirth || '',
            gender: data.gender || '',
            height: data.height || '',
            weight: data.weight || '',
            medicalConditions: data.medicalConditions || '',
            allergies: data.allergies || '',
            phoneNumber: data.phoneNumber || '',
            profileTheme: data.profileTheme || 'ocean',
          }));
          setProfileTheme(data.profileTheme || 'ocean');
        }
        
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Unable to load profile. Please try again.');
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user, authLoading, navigate, setProfileTheme]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    setHasUnsavedChanges(true);
    setValidationErrors(validateForm(newFormData));
    
    // Update theme context immediately when changed
    if (name === 'profileTheme') {
      setProfileTheme(value);
    }
    
    autoSave(newFormData);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      addNotification('error', 'Please fix the validation errors before saving.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Show saving state first
      addNotification('saving', 'Saving your profile...');
      
      // Save the data
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        email: user.email,
        updatedAt: new Date(),
        profileCompleted: true
      }, { merge: true });

      // Clear saving notification and show success
      setNotifications([]); // Clear immediately
      setTimeout(() => {
        addNotification('success', 'Profile saved successfully!');
        
        // Start fade out animation after success is shown
        setTimeout(() => {
          // Add fade-out class to notification
          const notification = document.querySelector('.notification-container');
          if (notification) {
            notification.classList.add('fade-out');
          }
          
          // Navigate after fade out
          setTimeout(() => {
            navigate('/chat');
          }, 500); // Increased from 300ms to 500ms for smoother transition
        }, 2500); // Increased from 1000ms to 2500ms to match the longer notification duration
      }, 100);

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      addNotification('error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 bg-gradient-to-br from-white to-sky-50/30 dark:from-gray-800 dark:to-gray-900/80" style={{ position: 'relative', zIndex: 10 }}>
        <div className="text-center mb-6">
          <h2 className={`text-3xl font-bold bg-gradient-to-r ${getThemeGradient(formData.profileTheme)} bg-clip-text text-transparent`} 
              style={{ 
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Your Profile</h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Keep your information up to date</p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-4 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 p-3 rounded-lg shadow-sm" role="alert">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}

        {isOffline && (
          <div className="mb-4 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-3 rounded-lg shadow-sm" role="alert">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  You are currently offline. Changes will be saved when you reconnect.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded-lg shadow-sm" role="alert">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Theme Selection */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className={`rounded-lg p-1 bg-gradient-to-r ${getThemeGradient(formData.profileTheme)}`}>
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className={`ml-2 text-lg font-medium bg-gradient-to-r ${getThemeGradient(formData.profileTheme)} bg-clip-text text-transparent`}
                  style={{ 
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Theme</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                formData.profileTheme === 'ocean' 
                  ? 'border-sky-500 bg-gradient-to-r from-sky-50 via-teal-50 to-green-50 dark:from-sky-900/20 dark:via-teal-900/20 dark:to-green-900/20 shadow-md' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-sky-200 dark:hover:border-sky-700'
              }`}>
                <input
                  type="radio"
                  name="profileTheme"
                  value="ocean"
                  checked={formData.profileTheme === 'ocean'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="h-8 w-full rounded-md bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 shadow-sm" />
                <span className="text-xs font-medium mt-2 bg-gradient-to-r from-sky-600 via-teal-600 to-green-600 bg-clip-text text-transparent">Ocean Breeze</span>
              </label>

              <label className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                formData.profileTheme === 'sunset' 
                  ? 'border-purple-500 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 shadow-md' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700'
              }`}>
                <input
                  type="radio"
                  name="profileTheme"
                  value="sunset"
                  checked={formData.profileTheme === 'sunset'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="h-8 w-full rounded-md bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-sm" />
                <span className="text-xs font-medium mt-2 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">Sunset Glow</span>
              </label>

              <label className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                formData.profileTheme === 'citrus' 
                  ? 'border-orange-500 bg-gradient-to-r from-orange-50 via-yellow-50 to-lime-50 dark:from-orange-900/20 dark:via-yellow-900/20 dark:to-lime-900/20 shadow-md' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
              }`}>
                <input
                  type="radio"
                  name="profileTheme"
                  value="citrus"
                  checked={formData.profileTheme === 'citrus'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="h-8 w-full rounded-md bg-gradient-to-r from-orange-500 via-yellow-400 to-lime-500 shadow-sm" />
                <span className="text-xs font-medium mt-2 bg-gradient-to-r from-orange-500 via-yellow-400 to-lime-500 bg-clip-text text-transparent">Citrus Burst</span>
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <div className="flex items-center mb-3">
              <div className={`rounded-lg p-1 bg-gradient-to-r ${getThemeGradient(formData.profileTheme)}`}>
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className={`ml-2 text-lg font-medium bg-gradient-to-r ${getThemeGradient(formData.profileTheme)} bg-clip-text text-transparent`}
                  style={{ 
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full rounded-lg border shadow-sm px-3 py-2 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-1 ${
                    validationErrors.fullName 
                      ? 'border-red-400 text-red-900 dark:text-red-200 placeholder-red-300 dark:placeholder-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/30'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-gray-700 dark:text-white'
                  }`}
                />
                {validationErrors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full rounded-lg border shadow-sm px-4 py-2.5 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 ${
                    validationErrors.dateOfBirth
                      ? 'border-red-300 text-red-900 dark:text-red-200 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:bg-red-900/30'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white'
                  }`}
                />
                {validationErrors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full rounded-lg border shadow-sm px-4 py-2.5 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 ${
                    validationErrors.gender
                      ? 'border-red-300 text-red-900 dark:text-red-200 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:bg-red-900/30'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                {validationErrors.gender && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border shadow-sm px-4 py-2.5 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 ${
                    validationErrors.phoneNumber
                      ? 'border-red-300 text-red-900 dark:text-red-200 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:bg-red-900/30'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white'
                  }`}
                  placeholder="Your phone number"
                />
                {validationErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Physical Information */}
          <div>
            <div className="flex items-center mb-3">
              <div className={`rounded-lg p-1 bg-gradient-to-r ${getThemeGradient(formData.profileTheme)}`}>
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className={`ml-2 text-lg font-medium bg-gradient-to-r ${getThemeGradient(formData.profileTheme)} bg-clip-text text-transparent`}
                  style={{ 
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Physical Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border shadow-sm px-4 py-2.5 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 ${
                    validationErrors.height
                      ? 'border-red-300 text-red-900 dark:text-red-200 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:bg-red-900/30'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white'
                  }`}
                />
                {validationErrors.height && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.height}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border shadow-sm px-4 py-2.5 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 ${
                    validationErrors.weight
                      ? 'border-red-300 text-red-900 dark:text-red-200 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:bg-red-900/30'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white'
                  }`}
                />
                {validationErrors.weight && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.weight}</p>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <div className="flex items-center mb-3">
              <div className={`rounded-lg p-1 bg-gradient-to-r ${getThemeGradient(formData.profileTheme)}`}>
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className={`ml-2 text-lg font-medium bg-gradient-to-r ${getThemeGradient(formData.profileTheme)} bg-clip-text text-transparent`}
                  style={{ 
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Medical Information</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medical Conditions</label>
                <textarea
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  rows="3"
                  className={`mt-1 block w-full rounded-lg border shadow-sm px-4 py-2.5 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 ${
                    validationErrors.medicalConditions
                      ? 'border-red-300 text-red-900 dark:text-red-200 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:bg-red-900/30'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white'
                  }`}
                  placeholder="List any medical conditions (optional)"
                />
                {validationErrors.medicalConditions && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.medicalConditions}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows="3"
                  className={`mt-1 block w-full rounded-lg border shadow-sm px-4 py-2.5 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 ${
                    validationErrors.allergies
                      ? 'border-red-300 text-red-900 dark:text-red-200 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:bg-red-900/30'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white'
                  }`}
                  placeholder="List any allergies (optional)"
                />
                {validationErrors.allergies && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.allergies}</p>
                )}
              </div>
            </div>
          </div>

          {/* Required fields note */}
          <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            <span className="text-red-500">*</span> Required fields
          </div>

          {/* Submit button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0}
              className={`px-6 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all duration-200 ${
                loading || Object.keys(validationErrors).length > 0
                  ? 'bg-gray-400 cursor-not-allowed opacity-60'
                  : `bg-gradient-to-r ${getThemeGradient(formData.profileTheme)} hover:opacity-90 focus:ring-2 focus:ring-offset-2 ${
                      formData.profileTheme === 'ocean'
                        ? 'focus:ring-sky-500'
                        : formData.profileTheme === 'sunset'
                        ? 'focus:ring-purple-500'
                        : 'focus:ring-amber-500'
                  }`
              }`}
            >
              {loading ? 'Saving...' : 'Save & Chat'}
            </button>
          </div>
        </form>
      </div>

      {/* Notifications Container */}
      <div className="fixed bottom-4 left-4 z-60">
        {notifications.map(({ id, type, message }) => (
          <div
            key={id}
            className="notification-container relative overflow-hidden rounded-lg shadow-xl bg-white dark:bg-gray-800 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 p-4 w-80 transform transition-all duration-500 ease-out animate-notification-slide-in"
          >
            <div className="flex items-center">
              {type === 'success' ? (
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r ${getThemeGradient(formData.profileTheme)} flex items-center justify-center animate-scale-check`}>
                  <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : type === 'error' ? (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
              <div className="ml-4 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {message}
                </p>
              </div>
            </div>

            {/* Progress bar - only show for success/error messages */}
            {type !== 'saving' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-700">
                <div
                  className={`h-full bg-gradient-to-r ${getThemeGradient(formData.profileTheme)}`}
                  style={{
                    animation: `shrink ${notificationDuration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                    transformOrigin: 'left'
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SVG Gradients Definitions */}
      <svg className="absolute" width="0" height="0">
        <defs>
          <linearGradient id="gradient-ocean" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="35%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="gradient-sunset" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id="gradient-citrus" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#65a30d" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Update the styles at the end of the file
const styles = `
@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

@keyframes scaleCheck {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-notification-slide-in {
  animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-scale-check {
  animation: scaleCheck 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.notification-container {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-container.fade-out {
  transform: translateX(-20px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default UserProfile; 