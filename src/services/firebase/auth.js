import { auth, GoogleAuthProvider } from './config';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    throw handleFirebaseError(error, 'Google sign-in');
  }
}; 