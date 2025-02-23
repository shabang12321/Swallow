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

// Development token setup
if (process.env.NODE_ENV === 'development') {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.REACT_APP_FIREBASE_APP_CHECK_DEBUG_TOKEN;
}

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
    failIfNotRegistered: false
  } : undefined;

  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
    debugOptions
  });
} catch (error) {
  console.error('Error initializing App Check:', error);
}

// Initialize Firestore with persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
});

// Initialize other services
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics conditionally
let analytics = null;
const initAnalytics = async () => {
  try {
    if (await isSupported()) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.error('Analytics not supported:', error);
  }
  return analytics;
};

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Enable Firestore persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
});

// Silent auth state observer
auth.onAuthStateChanged(() => {});

// Export initialized services
export { 
  app, 
  db, 
  appCheck,
  initAnalytics,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc
}; 