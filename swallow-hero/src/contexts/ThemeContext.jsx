import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [user] = useAuthState(auth);
  const [profileTheme, setProfileTheme] = useState('ocean');

  // Load theme from Firestore when user logs in
  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfileTheme(data.profileTheme || 'ocean');
          }
        } catch (error) {
          console.error('Error loading theme:', error);
        }
      }
    };

    loadTheme();
  }, [user]);

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

  const value = {
    profileTheme,
    setProfileTheme,
    getThemeGradient
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 