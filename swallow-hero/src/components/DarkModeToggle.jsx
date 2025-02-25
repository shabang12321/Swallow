import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setShowRipple(true);
    toggleDarkMode();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
    
    // Remove ripple effect
    setTimeout(() => {
      setShowRipple(false);
    }, 700);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={handleToggle}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg 
                   ${darkMode ? 'bg-gray-800' : 'bg-white'} 
                   hover:scale-110 transform transition-all duration-300 ease-in-out
                   ${isAnimating ? (darkMode ? 'dark-mode-in' : 'dark-mode-out') : ''}`}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Ripple effect */}
        {showRipple && (
          <span 
            className={`absolute inset-0 rounded-full animate-ping opacity-75 
                      ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
          />
        )}
        
        <div className="relative w-6 h-6 overflow-hidden">
          {/* Sun icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`absolute inset-0 w-6 h-6 transition-all duration-500 ease-in-out
                       ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}
            viewBox="0 0 20 20" 
            fill="currentColor"
            style={{ color: '#FDB813' }}
          >
            <path 
              fillRule="evenodd" 
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
              clipRule="evenodd" 
            />
          </svg>
          
          {/* Moon icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`absolute inset-0 w-6 h-6 transition-all duration-500 ease-in-out
                       ${darkMode ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}
            viewBox="0 0 20 20" 
            fill="currentColor"
            style={{ color: '#6366F1' }}
          >
            <path 
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" 
            />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default DarkModeToggle; 