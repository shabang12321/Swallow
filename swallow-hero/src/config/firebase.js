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
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Debug: Log environment variables (without sensitive values)
console.log('Firebase Config Check:', {
  hasApiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
  hasAuthDomain: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  hasProjectId: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
  hasStorageBucket: !!process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  hasMessagingSenderId: !!process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  hasAppId: !!process.env.REACT_APP_FIREBASE_APP_ID,
  hasMeasurementId: !!process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
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

export { db, analytics }; 