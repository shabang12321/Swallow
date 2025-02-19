import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  PhoneAuthProvider, 
  signInWithPopup, 
  signInWithPhoneNumber, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCy1v6PcdwpaS-xBjGy8ZLVXEEAEoJSPvM",
  authDomain: "swallowhero-ai.firebaseapp.com",
  projectId: "swallowhero-ai",
  storageBucket: "swallowhero-ai.appspot.com",
  messagingSenderId: "1061489851051",
  appId: "1:1061489851051:web:91ab41bf14293c76f395ee",
  measurementId: "G-YJ8T10ESN2"
};

// Debug Firebase configuration
console.log('Initializing Firebase with config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
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
export const phoneProvider = new PhoneAuthProvider(auth);

// Enhanced auth functions with error handling
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signInWithPhone = async (phoneNumber, appVerifier) => {
  try {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  } catch (error) {
    console.error('Phone sign-in error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Email sign-up error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
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

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Export analytics if needed
export { analytics }; 