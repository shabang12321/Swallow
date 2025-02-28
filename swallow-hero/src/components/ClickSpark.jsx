import { useRef, useEffect, useCallback } from "react";
import { useTheme } from '../contexts/ThemeContext';

const ClickSpark = ({
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1.0,
}) => {
  const { profileTheme } = useTheme();
  
  // Define theme-based colors
  const getThemeColors = () => {
    switch (profileTheme) {
      case 'sunset':
        return ['#a855f7', '#ec4899', '#f43f5e']; // purple-500, pink-500, rose-500
      case 'citrus':
        return ['#f59e0b', '#eab308', '#84cc16']; // amber-500, yellow-500, lime-500
      case 'ocean':
      default:
        return ['#0ea5e9', '#14b8a6', '#22c55e']; // sky-500, teal-500, green-500
    }
  };

  const canvasRef = useRef(null);
  const sparksRef = useRef([]); // Stores spark data
  const startTimeRef = useRef(null); // Tracks initial timestamp for animation

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      // Set canvas size to match window size and handle device pixel ratio
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Set display size (css pixels)
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      // Set actual size in memory (scaled to account for extra pixel density)
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      
      // Normalize coordinate system to use css pixels
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    };

    // Add click handler to document
    const handleDocumentClick = (e) => {
      const x = e.clientX; // Use direct client coordinates
      const y = e.clientY;

      const now = performance.now();
      const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
        x,
        y,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
      }));

      sparksRef.current.push(...newSparks);
    };

    // Handle resize
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('click', handleDocumentClick);

    // Initial sizing
    resizeCanvas();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [sparkCount]);

  const easeFunc = useCallback(
    (t) => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let animationId;

    const draw = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);

        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        // Points for the spark line
        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        // Get theme colors and use them for sparks
        const colors = getThemeColors();
        const colorIndex = Math.floor((spark.angle / (2 * Math.PI)) * colors.length);
        ctx.strokeStyle = colors[colorIndex % colors.length];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    sparkSize,
    sparkRadius,
    sparkCount,
    duration,
    easeFunc,
    extraScale,
    profileTheme
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 select-none pointer-events-none"
      style={{ 
        zIndex: 9999,
        width: '100vw',
        height: '100vh'
      }}
    />
  );
};

export default ClickSpark; 