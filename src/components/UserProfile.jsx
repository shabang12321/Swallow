  try {
    // ... existing code ...
  } catch (error) {
    console.error('Error checking user profile:', {
      code: error.code,
      message: error.message,
      isFirebaseError: error.name === 'FirebaseError',
      stack: error.stack
    });
    
    let errorMessage = 'Unable to load profile. ';
    if (!db) {
      errorMessage += 'Database not configured. Please check your Firebase setup.';
    } else if (isOffline) {
      errorMessage += 'You are currently offline.';
    } else if (error.code === 'permission-denied') {
      errorMessage += 'Permission denied. Please check Firestore rules.';
    } else {
      errorMessage += error.message || 'Please try again.';
    }
    
    setError(errorMessage);
    setLoading(false);
    
    // Increment retry count if offline
    if (isOffline && retryCount < 3) {
      setRetryCount(prev => prev + 1);
    }
  } 