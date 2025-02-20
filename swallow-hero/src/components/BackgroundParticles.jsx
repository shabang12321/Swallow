import React from 'react';
import Particles from './Particles';

const BackgroundParticles = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Particles
        particleColors={['#0ea5e9', '#14b8a6', '#22c55e']} // sky-500, teal-500, green-500
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