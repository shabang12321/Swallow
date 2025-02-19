import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
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

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link to="/" className={`nav-link ${isActive('/') ? 'bg-sky-50 text-sky-600' : ''}`}>
              Home
            </Link>
            <Link to="/chat" className={`nav-link ${isActive('/chat') ? 'bg-sky-50 text-sky-600' : ''}`}>
              AI Chat
            </Link>
            <Link to="/faq" className={`nav-link ${isActive('/faq') ? 'bg-sky-50 text-sky-600' : ''}`}>
              FAQ
            </Link>
            <Link to="/plans" className={`nav-link ${isActive('/plans') ? 'bg-sky-50 text-sky-600' : ''}`}>
              Plans
            </Link>
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'bg-sky-50 text-sky-600' : ''}`}>
              About
            </Link>
            <Link to="/chat" className="btn-primary ml-4">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
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
          <Link 
            to="/chat" 
            className="block w-full text-center px-3 py-2 rounded-md text-base font-medium btn-primary mt-4"
            onClick={handleLinkClick}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 