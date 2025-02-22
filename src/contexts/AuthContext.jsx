import React, { createContext, useState, useContext } from 'react';
import { auth } from '../services/firebase/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  // ... auth state management
}; 