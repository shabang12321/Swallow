import React, { useState, useEffect, useRef } from 'react';
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
  const userMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  // Handle click outside user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      handleLinkClick();
      if (location.pathname === '/chat') {
        navigate('/');
      }
    } catch (error) {
      console.error('Sign out failed');
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-50 bg-white">
        <div className="flex justify-between h-16 bg-white relative">
          {/* Logo and brand */}
          <div className="flex items-center relative z-50">
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
          <div className="hidden lg:flex lg:items-center lg:space-x-1 relative z-50">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              Home
            </Link>
            <Link 
              to="/chat" 
              className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              AI Chat
            </Link>
            <Link 
              to="/faq" 
              className={`nav-link ${isActive('/faq') ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              FAQ
            </Link>
            <Link 
              to="/plans" 
              className={`nav-link ${isActive('/plans') ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              Plans
            </Link>
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              About
            </Link>

            {user ? (
              <div className="relative ml-4" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 flex items-center justify-center text-white font-medium">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm text-gray-700">{user.email}</span>
                  <svg className={`w-4 h-4 text-gray-500 transform transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={handleLinkClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Edit Profile
                      </div>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </div>
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
          <div className="flex items-center lg:hidden relative z-50">
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
        <>
          {/* Overlay to handle outside clicks */}
          <div 
            className="fixed inset-0 bg-black/20 z-30 lg:hidden" 
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(false);
            }}
          />
          <div 
            className="absolute inset-x-0 top-full z-40 lg:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white shadow-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link 
                  to="/" 
                  className={`block px-3 py-2 rounded-md text-base font-medium text-center cursor-pointer ${
                    isActive('/') ? 'text-sky-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={handleLinkClick}
                >
                  Home
                </Link>
                <Link 
                  to="/chat" 
                  className={`block px-3 py-2 rounded-md text-base font-medium text-center cursor-pointer ${
                    isActive('/chat') ? 'text-sky-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={handleLinkClick}
                >
                  AI Chat
                </Link>
                <Link 
                  to="/faq" 
                  className={`block px-3 py-2 rounded-md text-base font-medium text-center cursor-pointer ${
                    isActive('/faq') ? 'text-sky-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={handleLinkClick}
                >
                  FAQ
                </Link>
                <Link 
                  to="/plans" 
                  className={`block px-3 py-2 rounded-md text-base font-medium text-center cursor-pointer ${
                    isActive('/plans') ? 'text-sky-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={handleLinkClick}
                >
                  Plans
                </Link>
                <Link 
                  to="/about" 
                  className={`block px-3 py-2 rounded-md text-base font-medium text-center cursor-pointer ${
                    isActive('/about') ? 'text-sky-600' : 'text-gray-700 hover:bg-gray-50'
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
                    className="w-full mt-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 rounded-lg hover:from-sky-600 hover:via-teal-600 hover:to-green-600 transition-all duration-200 cursor-pointer"
                  >
                    Sign In
                  </button>
                ) : (
                  <div className="border-t border-gray-200 mt-4 pt-4 text-center">
                    <div className="px-4 py-2 text-sm text-gray-700">
                      Signed in as: {user.email}
                    </div>
                    <Link
                      to="/profile"
                      onClick={handleLinkClick}
                      className="block w-full mt-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Edit Profile
                      </div>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full mt-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navigation; 