import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected Chat Route - Only this needs auth
const ProtectedChatRoute = () => {
  const [user, loading] = useAuthState(auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 hero-gradient">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in or create an account to access the AI Chat feature.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setShowAuthModal(true)}
              className="block w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 rounded-lg hover:from-sky-600 hover:via-teal-600 hover:to-green-600 transition-all duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => window.history.back()}
              className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
        {showAuthModal && <Auth onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  return <ChatInterface />;
};

const App = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Debug environment variables and initialization
    console.log('App Environment:', {
      nodeEnv: process.env.NODE_ENV,
      hasOpenAIKey: !!process.env.REACT_APP_OPENAI_API_KEY,
      hasFirebaseConfig: !!process.env.REACT_APP_FIREBASE_API_KEY
    });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        {/* Navigation with auth button */}
        <Navigation onAuthClick={() => setShowAuthModal(true)} />
        
        {/* Main content */}
        <div className="flex-1">
          <Routes>
            {/* Public routes - Freely accessible without auth */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/plans" element={<Plans />} />

            {/* Protected route - Only chat requires auth */}
            <Route path="/chat" element={<ProtectedChatRoute />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Auth Modal - Only shown when explicitly triggered */}
          {showAuthModal && (
            <Auth onClose={handleCloseAuth} />
          )}
        </div>
      </div>
    </Router>
  );
};

export default App; 