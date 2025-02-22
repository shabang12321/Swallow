import React, { useEffect, useRef } from 'react';
import Renderer from '../utils/Renderer';
import Camera from '../utils/Camera';

const Particles = ({ particleCount, particleSpread, speed, particleColors, moveParticlesOnHover, 
                    particleHoverFactor, alphaParticles, particleBaseSize, sizeRandomness, 
                    cameraDistance, disableRotation }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ depth: false, alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    // Batch DOM updates
    const state = {
      mouseX: 0,
      mouseY: 0,
      scrollY: 0,
      needsUpdate: false
    };

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };

    const handleScroll = () => {
      state.scrollY = window.scrollY * 0.001;
      state.needsUpdate = true;
    };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      state.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      state.mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      state.needsUpdate = true;
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    if (moveParticlesOnHover) {
      container.addEventListener("mousemove", handleMouseMove, { passive: true });
    }
    resize();

    // ... existing particle setup code ...

    let animationFrameId;
    let lastTime = performance.now();
    let elapsed = 0;

    const update = (t) => {
      const delta = t - lastTime;
      lastTime = t;
      elapsed += delta * speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      // Only update positions if needed
      if (state.needsUpdate) {
        if (moveParticlesOnHover) {
          particles.position.x = -state.mouseX * particleHoverFactor;
          particles.position.y = -state.mouseY * particleHoverFactor;
        }
        particles.position.y = state.scrollY * 2;
        state.needsUpdate = false;
      }

      // Optimize rotation calculations
      if (!disableRotation) {
        const rotX = Math.sin(elapsed * 0.0002) * 0.1;
        const rotY = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.set(rotX, rotY, particles.rotation.z + 0.01 * speed);
      }

      renderer.render({ scene: particles, camera });
      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      if (moveParticlesOnHover) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      renderer.dispose();
    };
  }, [particleCount, particleSpread, speed, particleColors, moveParticlesOnHover, 
      particleHoverFactor, alphaParticles, particleBaseSize, sizeRandomness, 
      cameraDistance, disableRotation]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default Particles; 