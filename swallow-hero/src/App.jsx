import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase';
import Navigation from './components/Navigation';
import ChatInterface from './components/ChatInterface';
import FAQPage from './pages/FAQPage';
import Auth from './components/Auth';
import Loading from './components/Loading';
import About from './pages/About';
import Plans from './pages/Plans';
import Home from './pages/Home';
import UserProfile from './components/UserProfile';
import ClickSpark from './components/ClickSpark';
import BackgroundParticles from './components/BackgroundParticles';
import { ThemeProvider } from './contexts/ThemeContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from './config/firebase';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  // If not authenticated, show auth modal
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl shadow-lg p-8 text-center bg-white dark:bg-gray-800 transition-colors duration-200"
          style={{ 
            isolation: 'isolate',
            position: 'relative',
            zIndex: 1,
            backgroundImage: 'none !important',
            backdropFilter: 'none !important',
            WebkitBackdropFilter: 'none !important'
          }}
        >
          <div 
            style={{
              content: '""',
              position: 'absolute',
              inset: 0,
              zIndex: -1,
              borderRadius: '1rem'
            }}
            className="bg-white dark:bg-gray-800 transition-colors duration-200"
          />
          <h2 className="text-2xl font-bold mb-4 hero-gradient relative z-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 relative z-2 transition-colors duration-200">
            Please sign in or create an account to continue.
          </p>
          <div className="space-y-4 relative z-2">
            <button
              onClick={() => setShowAuthModal(true)}
              className="block w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 rounded-lg hover:from-sky-600 hover:via-teal-600 hover:to-green-600 transition-all duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => window.history.back()}
              className="block w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
        {showAuthModal && <Auth onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  // If authenticated, render the protected content
  return children;
};

// Profile Required Route Component
const ProfileRequiredRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      // If no user or still loading, set profileChecked and exit
      if (!user) {
        setProfileChecked(true);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const isProfileComplete = userDoc.exists() && userDoc.data().profileCompleted;
        setHasProfile(isProfileComplete);
        setProfileChecked(true);

        // If on a protected route and profile is not complete, redirect to profile
        if (!isProfileComplete && location.pathname !== '/profile') {
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setProfileChecked(true);
      }
    };

    checkProfile();
  }, [user, location.pathname, navigate]);

  if (loading || !profileChecked) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
};

const App = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Any essential initialization can stay here
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 transition-colors duration-200">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  return (
    <Router>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen transition-colors duration-200">
          <ScrollToTop />
          <Navigation onAuthClick={() => setShowAuthModal(true)} />
          {showAuthModal && (
            <Auth onClose={handleCloseAuth} />
          )}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={
              <ProfileRequiredRoute>
                <ChatInterface />
              </ProfileRequiredRoute>
            } />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
          </Routes>
          <ClickSpark />
          <BackgroundParticles />
        </div>
      </ThemeProvider>
    </Router>
  );
};

export default App; 