import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, PhoneAuthProvider, signInWithPopup, signInWithPhoneNumber, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCy1v6PcdwpaS-xBjGy8ZLVXEEAEoJSPvM",
  authDomain: "swallowhero-ai.firebaseapp.com",
  projectId: "swallowhero-ai",
  storageBucket: "swallowhero-ai.firebasestorage.app",
  messagingSenderId: "1061489851051",
  appId: "1:1061489851051:web:91ab41bf14293c76f395ee",
  measurementId: "G-YJ8T10ESN2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
export const phoneProvider = new PhoneAuthProvider(auth);

// Export auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithPhone = (phoneNumber, appVerifier) => 
  signInWithPhoneNumber(auth, phoneNumber, appVerifier);
export const signUpWithEmail = (email, password) => 
  createUserWithEmailAndPassword(auth, email, password);
export const signInWithEmail = (email, password) => 
  signInWithEmailAndPassword(auth, email, password);
export const logOut = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback); 