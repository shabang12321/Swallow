// Initialize Analytics with proper error handling
const initAnalytics = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
    console.log('Analytics not supported in this environment');
    return null;
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
    return null;
  }
};

const analytics = await initAnalytics();

export { 
  app, 
  auth, 
  db, 
  storage, 
  analytics,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
}; 