import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';

const Navigation = ({ onAuthClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user] = useAuthState(auth);

  const isActive = (path) => location.pathname === path;

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      handleLinkClick();
      // If on a protected route, redirect to home
      if (location.pathname === '/chat') {
        navigate('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={handleLinkClick}>
              <img 
                src={require('../assets/logo.png')} 
                alt="Swallow Hero Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold hero-gradient">Swallow Hero</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'bg-sky-50 text-sky-600' : ''}`}
              onClick={handleLinkClick}
            >
              Home
            </Link>
            <Link 
              to="/chat" 
              className={`nav-link ${isActive('/chat') ? 'bg-sky-50 text-sky-600' : ''}`}
              onClick={handleLinkClick}
            >
              AI Chat
            </Link>
            <Link 
              to="/faq" 
              className={`nav-link ${isActive('/faq') ? 'bg-sky-50 text-sky-600' : ''}`}
              onClick={handleLinkClick}
            >
              FAQ
            </Link>
            <Link 
              to="/plans" 
              className={`nav-link ${isActive('/plans') ? 'bg-sky-50 text-sky-600' : ''}`}
              onClick={handleLinkClick}
            >
              Plans
            </Link>
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'bg-sky-50 text-sky-600' : ''}`}
              onClick={handleLinkClick}
            >
              About
            </Link>

            {user ? (
              <div className="relative ml-4">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 flex items-center justify-center text-white font-medium">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm text-gray-700">{user.email}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 rounded-lg hover:from-sky-600 hover:via-teal-600 hover:to-green-600 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') ? 'bg-sky-50 text-sky-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={handleLinkClick}
            >
              Home
            </Link>
            <Link 
              to="/chat" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/chat') ? 'bg-sky-50 text-sky-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={handleLinkClick}
            >
              AI Chat
            </Link>
            <Link 
              to="/faq" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/faq') ? 'bg-sky-50 text-sky-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={handleLinkClick}
            >
              FAQ
            </Link>
            <Link 
              to="/plans" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/plans') ? 'bg-sky-50 text-sky-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={handleLinkClick}
            >
              Plans
            </Link>
            <Link 
              to="/about" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/about') ? 'bg-sky-50 text-sky-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={handleLinkClick}
            >
              About
            </Link>

            {!user ? (
              <button
                onClick={() => {
                  onAuthClick();
                  handleLinkClick();
                }}
                className="w-full mt-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 rounded-lg hover:from-sky-600 hover:via-teal-600 hover:to-green-600 transition-all duration-200"
              >
                Sign In
              </button>
            ) : (
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="px-4 py-2 text-sm text-gray-700">
                  Signed in as: {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full mt-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 