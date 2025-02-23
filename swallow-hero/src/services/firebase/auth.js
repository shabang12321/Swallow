import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from '../../config/firebase';

const handleFirebaseError = (error, operation) => {
  console.error(`Error during ${operation}:`, error);
  
  const errorMessages = {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-email': 'Invalid email address',
    'auth/email-already-in-use': 'Email is already registered',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/popup-closed-by-user': 'Sign-in cancelled by user',
    'auth/cancelled-popup-request': 'Only one popup request allowed at a time',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/invalid-credential': 'Invalid credentials',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/requires-recent-login': 'Please sign in again to complete this operation'
  };

  const message = errorMessages[error.code] || error.message || 'An error occurred';
  throw new Error(`${operation} failed: ${message}`);
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    throw handleFirebaseError(error, 'Google sign-in');
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    throw handleFirebaseError(error, 'Email sign-in');
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    throw handleFirebaseError(error, 'Email sign-up');
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw handleFirebaseError(error, 'Sign-out');
  }
}; 