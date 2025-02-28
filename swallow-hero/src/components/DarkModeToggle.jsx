import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleDarkMode();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={handleToggle}
        className={`relative w-16 h-8 rounded-full shadow-lg transition-all duration-300 ease-in-out
                   ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Toggle switch track */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* Background pattern for light mode */}
          {!darkMode && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-sky-100 opacity-70"></div>
          )}
          
          {/* Background pattern for dark mode */}
          {darkMode && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 opacity-70">
              <div className="absolute inset-0 opacity-30">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-0.5 h-0.5 bg-white rounded-full"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.5 + 0.3
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Toggle switch thumb/knob */}
        <div 
          className={`absolute top-1 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out
                     ${darkMode ? 'translate-x-9 bg-indigo-500' : 'translate-x-1 bg-yellow-400'}`}
        >
          {/* Sun icon */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${darkMode ? 'opacity-0' : 'opacity-100'}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-4 h-4 text-yellow-600"
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          
          {/* Moon icon */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${darkMode ? 'opacity-100' : 'opacity-0'}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-4 h-4 text-white"
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" 
              />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
};

export default DarkModeToggle; 