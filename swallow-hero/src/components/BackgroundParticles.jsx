import React, { useState, useEffect } from 'react';
import Particles from './Particles';
import { useTheme } from '../contexts/ThemeContext';

const BackgroundParticles = () => {
  const { darkMode } = useTheme();
  const [particleColors, setParticleColors] = useState(['#0ea5e9', '#14b8a6', '#22c55e']);
  
  useEffect(() => {
    if (darkMode) {
      // Brighter colors for dark mode for better visibility
      setParticleColors(['#38bdf8', '#2dd4bf', '#4ade80']);
    } else {
      // Original colors for light mode
      setParticleColors(['#0ea5e9', '#14b8a6', '#22c55e']);
    }
  }, [darkMode]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
      <Particles
        particleColors={particleColors}
        particleCount={20000}
        particleSpread={20}
        speed={0.08}
        particleBaseSize={120}
        moveParticlesOnHover={true}
        particleHoverFactor={0.8}
        alphaParticles={true}
        sizeRandomness={0.7}
        cameraDistance={30}
        disableRotation={false}
      />
    </div>
  );
};

export default BackgroundParticles; 