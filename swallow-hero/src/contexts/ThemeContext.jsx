import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [user] = useAuthState(auth);
  const [profileTheme, setProfileTheme] = useState('ocean');
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    // Otherwise check for preferred color scheme
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Load theme from Firestore when user logs in
  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfileTheme(data.profileTheme || 'ocean');
            
            // If user has dark mode preference stored, use that
            if (data.darkMode !== undefined) {
              setDarkMode(data.darkMode);
            }
          }
        } catch (error) {
          console.error('Error loading theme:', error);
        }
      }
    };

    loadTheme();
  }, [user]);

  // Save dark mode preference to Firestore when it changes (if user is logged in)
  useEffect(() => {
    const saveDarkMode = async () => {
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            darkMode: darkMode
          });
        } catch (error) {
          console.error('Error saving dark mode preference:', error);
        }
      }
    };

    saveDarkMode();
  }, [darkMode, user]);

  const getThemeGradient = (theme) => {
    switch (theme) {
      case 'sunset':
        return 'from-purple-600 via-pink-600 to-rose-600';
      case 'citrus':
        return 'from-orange-500 via-yellow-400 to-lime-500';
      case 'ocean':
      default:
        return 'from-sky-500 via-teal-500 to-green-500';
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const value = {
    profileTheme,
    setProfileTheme,
    getThemeGradient,
    darkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 