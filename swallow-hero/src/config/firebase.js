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

// Only keep development token, remove console.log
if (process.env.NODE_ENV === 'development') {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.REACT_APP_FIREBASE_APP_CHECK_DEBUG_TOKEN;
}

// Remove environment variables logging block
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

// Initialize App Check - remove success logging
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

// Initialize Firestore - remove debug logging
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
});

// Initialize other services
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics without logging
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(console.error);

// Initialize providers
export const googleProvider = new GoogleAuthProvider();

// Clean up auth functions - remove success logging
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    console.error('Email sign-up error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

// Remove auth state change logging
auth.onAuthStateChanged(() => {});

// Clean up testAppCheck function - remove success logging
export const testAppCheck = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required for App Check test');
    }
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists();
  } catch (error) {
    console.error('App Check Verification Failed:', error);
    return false;
  }
};

// Only keep essential development tools
if (process.env.NODE_ENV === 'development') {
  window.testAppCheckWithCurrentUser = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    return testAppCheck(currentUser.uid);
  };
}

export { db, analytics, appCheck }; 