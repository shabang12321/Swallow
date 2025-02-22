import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache,
  persistentSingleTabManager,
  CACHE_SIZE_UNLIMITED,
  enableIndexedDbPersistence,
  doc,
  getDoc
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from '@firebase/app-check';

// Enable App Check debug token for development
if (process.env.NODE_ENV === 'development') {
  // This must be called before any other firebase functions
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = 'f6c5300a-8bed-4783-b703-088be7aee299';
  console.log('Using App Check debug token:', window.FIREBASE_APPCHECK_DEBUG_TOKEN);
}

// Debug: Log environment variables (without sensitive values)
console.log('Firebase Config Check:', {
  hasApiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
  hasAuthDomain: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  hasProjectId: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
  hasStorageBucket: !!process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  hasMessagingSenderId: !!process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  hasAppId: !!process.env.REACT_APP_FIREBASE_APP_ID,
  hasMeasurementId: !!process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  hasRecaptchaSiteKey: !!process.env.REACT_APP_RECAPTCHA_SITE_KEY
});

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check
let appCheck = null;
try {
  if (!process.env.REACT_APP_RECAPTCHA_SITE_KEY) {
    throw new Error('Missing reCAPTCHA site key');
  }
  
  const debugOptions = process.env.NODE_ENV === 'development' ? {
    isTokenAutoRefreshEnabled: true,
    failIfNotRegistered: false // Important for development
  } : undefined;

  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
    debugOptions
  });

  console.log('App Check initialized successfully with debug mode:', process.env.NODE_ENV === 'development');
} catch (error) {
  console.error('Error initializing App Check:', error);
}

// Initialize Firestore with offline persistence enabled from the start
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
});

// Debug: Log Firestore initialization
console.log('Firestore Initialization:', {
  isDatabaseInitialized: !!db,
  projectId: db?.app?.options?.projectId
});

// Initialize other services
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics conditionally
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(console.error);

// Initialize providers
export const googleProvider = new GoogleAuthProvider();

// Enhanced auth functions with error handling and debug logging
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google Sign-in Success:', { 
      isNewUser: result?.additionalUserInfo?.isNewUser,
      hasUser: !!result.user
    });
    return result;
  } catch (error) {
    console.error('Google sign-in error:', {
      code: error.code,
      message: error.message,
      isFirebaseError: error.name === 'FirebaseError'
    });
    throw error;
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Email Sign-up Success:', { 
      hasUser: !!result.user,
      email: result.user?.email 
    });
    return result;
  } catch (error) {
    console.error('Email sign-up error:', {
      code: error.code,
      message: error.message,
      isFirebaseError: error.name === 'FirebaseError'
    });
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Email Sign-in Success:', { 
      hasUser: !!result.user,
      email: result.user?.email 
    });
    return result;
  } catch (error) {
    console.error('Email sign-in error:', {
      code: error.code,
      message: error.message,
      isFirebaseError: error.name === 'FirebaseError'
    });
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    console.log('Sign-out successful');
  } catch (error) {
    console.error('Sign-out error:', {
      code: error.code,
      message: error.message,
      isFirebaseError: error.name === 'FirebaseError'
    });
    throw error;
  }
};

// Debug: Add auth state change logging
auth.onAuthStateChanged((user) => {
  console.log('Auth State Changed:', {
    isAuthenticated: !!user,
    userId: user?.uid,
    email: user?.email
  });
});

export const testAppCheck = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required for App Check test');
    }
    
    // Try to read the user's document
    const userDoc = await getDoc(doc(db, 'users', userId));
    console.log('App Check Verification:', {
      success: true,
      documentExists: userDoc.exists(),
      timestamp: new Date().toISOString(),
      userId
    });
    return true;
  } catch (error) {
    console.error('App Check Verification Failed:', {
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      userId
    });
    return false;
  }
};

// Make testAppCheck available globally for testing
if (process.env.NODE_ENV === 'development') {
  window.testAppCheck = async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required for App Check test');
      }
      
      // Try to read the user's document
      const userDoc = await getDoc(doc(db, 'users', userId));
      console.log('App Check Verification:', {
        success: true,
        documentExists: userDoc.exists(),
        timestamp: new Date().toISOString(),
        userId
      });
      return true;
    } catch (error) {
      console.error('App Check Verification Failed:', {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
        userId
      });
      return false;
    }
  };

  // Add convenience method to test with current user
  window.testAppCheckWithCurrentUser = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No user is currently signed in');
      return false;
    }
    return window.testAppCheck(currentUser.uid);
  };
}

export { db, analytics, appCheck }; 