import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Prompt } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import debounce from 'lodash/debounce';

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
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    medicalConditions: '',
    allergies: '',
    emergencyContact: '',
    phoneNumber: '',
  });

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
        await setDoc(doc(db, 'users', user.uid), {
          ...data,
          email: user.email,
          updatedAt: new Date(),
        }, { merge: true });
        setSuccess('Changes saved automatically');
        setTimeout(() => setSuccess(null), 3000);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save error:', error);
      } finally {
        setSaving(false);
      }
    }, 2000),
    [user]
  );

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
            emergencyContact: data.emergencyContact || '',
            phoneNumber: data.phoneNumber || '',
          }));
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
  }, [user, authLoading, navigate]);

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
    autoSave(newFormData);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix the validation errors before saving.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        email: user.email,
        updatedAt: new Date(),
      }, { merge: true });

      setSuccess('Profile saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
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
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Unsaved changes warning */}
        {hasUnsavedChanges && (
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You have unsaved changes
                  {saving && ' (Saving...)'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {isOffline && (
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You are currently offline. Changes will be saved when you reconnect.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-center mb-6">Edit Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.fullName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.fullName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.dateOfBirth}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.gender ? 'border-red-300' : 'border-gray-300'
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
            <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.height ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.height && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.height}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.weight ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.weight && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.weight}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
            <textarea
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.medicalConditions ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="List any medical conditions (optional)"
            />
            {validationErrors.medicalConditions && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.medicalConditions}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Allergies</label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.allergies ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="List any allergies (optional)"
            />
            {validationErrors.allergies && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.allergies}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.emergencyContact ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Name and relationship"
            />
            {validationErrors.emergencyContact && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.emergencyContact}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Your phone number"
            />
            {validationErrors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.phoneNumber}</p>
            )}
          </div>

          {/* Add a note about required fields */}
          <div className="text-sm text-gray-500 mt-2">
            <span className="text-red-500">*</span> Required fields
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 rounded-lg hover:from-sky-600 hover:via-teal-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile; 