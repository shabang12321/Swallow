import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const { profileTheme, getThemeGradient } = useTheme();
  
  // Enhanced spring physics for progress bar
  const scaleX = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  });

  // Get the appropriate gradient for the user's theme preference
  const themeGradient = getThemeGradient(profileTheme);

  return (
    <motion.div 
      className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r ${themeGradient} z-50`}
      style={{ scaleX, transformOrigin: "0%" }}
    />
  );
};

export default ScrollProgressBar; 