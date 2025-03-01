import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionPlans from '../components/SubscriptionPlans';
import { motion, useScroll, useTransform, useSpring, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTheme } from '../contexts/ThemeContext';

// Enhanced animated section with various animation options
const AnimatedSection = ({ 
  children, 
  delay = 0, 
  threshold = 0.3,
  viewport = "0px 0px -10% 0px",
  animation = "fadeUp" // options: fadeUp, fadeIn, scaleUp, slideIn
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: threshold,
    rootMargin: viewport
  });
  
  const controls = useAnimation();
  
  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);
  
  // Different animation variants with improved easing curves
  const variants = {
    fadeUp: {
      hidden: { opacity: 0, y: 40 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.8, 
          delay, 
          ease: [0.25, 0.1, 0.25, 1.0] // cubic-bezier easing for smooth movement
        }
      }
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          duration: 1.2, 
          delay, 
          ease: "easeOut" 
        }
      }
    },
    scaleUp: {
      hidden: { opacity: 0, scale: 0.92 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          duration: 0.7, 
          delay, 
          ease: [0.34, 1.56, 0.64, 1] // spring-like easing
        }
      }
    },
    slideIn: {
      hidden: { opacity: 0, x: -40 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration: 0.9, 
          delay, 
          ease: [0.25, 0.1, 0.25, 1.0]
        }
      }
    },
    slideUp: {
      hidden: { opacity: 0, y: 60 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.9, 
          delay, 
          ease: [0.165, 0.84, 0.44, 1] // more pronounced easing curve
        }
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants[animation]}
    >
      {children}
    </motion.div>
  );
};

// Improved staggered children animation component
const StaggerContainer = ({ children, delayChildren = 0.15, staggerChildren = 0.12, threshold = 0.2, viewport = "0px 0px -10% 0px" }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: threshold,
    rootMargin: viewport
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren,
        staggerChildren,
        ease: "easeOut",
        duration: 0.4
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
};

// Enhanced stagger item with improved motion physics
const StaggerItem = ({ children, variants, className = "" }) => {
  const defaultVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  };

  return (
    <motion.div className={className} variants={variants || defaultVariants}>
      {children}
    </motion.div>
  );
};

// Refined parallax with smoother physics
const ParallaxSection = ({ children, intensity = 0.2 }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -200 * intensity]);
  
  // Improved spring physics for smoother parallax
  const springY = useSpring(y, { 
    stiffness: 85, 
    damping: 20,
    restDelta: 0.001
  });

  return (
    <motion.div style={{ y: springY }}>
      {children}
    </motion.div>
  );
};

// Enhanced reveal thresholds for scroll animations
const useScrollReveal = (threshold = 0.5, once = true, margin = "0px 0px -15% 0px") => {
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold: threshold,
    rootMargin: margin
  });
  
  return [ref, inView];
};

const Home = () => {
  const navigate = useNavigate();
  const { profileTheme, getThemeGradient } = useTheme();
  
  // Get the appropriate gradient for the user's theme preference
  const themeGradient = getThemeGradient(profileTheme);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Refined animation timing */}
      <AnimatedSection delay={0.2} animation="fadeIn" threshold={0.1}>
        <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 hero-gradient px-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 1.4, 
                  ease: [0.19, 1.0, 0.22, 1.0], // refined ease curve for smoother scaling
                  delay: 0.3
                }}
              >
                Your Personal Supplement Hero
              </motion.h1>
              <motion.p 
                className="text-lg sm:text-xl text-gray-800 dark:text-gray-200 max-w-2xl mx-auto mb-6 sm:mb-8 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  duration: 1.2, 
                  delay: 0.6, 
                  ease: "easeOut" 
                }}
              >
                Chat with our AI to discover the perfect supplements for your health journey.
                Get personalized recommendations based on your unique needs.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.9, 
                  delay: 1.0,
                  ease: [0.165, 0.84, 0.44, 1]
                }}
              >
                <motion.button 
                  onClick={() => navigate('/chat')} 
                  className="btn-primary btn-lg"
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.12)",
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Chat FREE Now
                  <motion.svg 
                    className="w-5 h-5 icon-right" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </motion.button>
                <motion.button 
                  onClick={() => navigate('/about')}
                  className="btn-outline text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                  <motion.svg 
                    className="w-5 h-5 icon-right" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Features Section - Enhanced staggered animations */}
      <StaggerContainer 
        delayChildren={0.3} 
        staggerChildren={0.15} 
        threshold={0.15}
        viewport="0px 0px -10% 0px"
      >
        <div className="mt-16 sm:mt-20 mb-24 sm:mb-32 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4 max-w-7xl mx-auto">
          <StaggerItem>
            <motion.div 
              className="card p-6 flex flex-col items-center text-center"
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15 
                }
              }}
            >
              <motion.div 
                className="w-12 h-12 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ 
                  rotate: 10, 
                  scale: 1.1,
                  transition: { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 10 
                  }
                }}
              >
                <svg className="w-6 h-6 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Personalized Advice</h3>
              <p className="text-gray-800 dark:text-gray-200">Get tailored supplement recommendations based on your unique health profile.</p>
            </motion.div>
          </StaggerItem>
          
          <StaggerItem>
            <motion.div 
              className="card p-6 flex flex-col items-center text-center"
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15 
                }
              }}
            >
              <motion.div 
                className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ 
                  rotate: 10, 
                  scale: 1.1,
                  transition: { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 10 
                  }
                }}
              >
                <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Quick Results</h3>
              <p className="text-gray-800 dark:text-gray-200">Instant AI-powered analysis and recommendations for your health goals.</p>
            </motion.div>
          </StaggerItem>
          
          <StaggerItem>
            <motion.div 
              className="card p-6 flex flex-col items-center text-center"
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15 
                }
              }}
            >
              <motion.div 
                className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4"
                whileHover={{ 
                  rotate: 10, 
                  scale: 1.1,
                  transition: { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 10 
                  }
                }}
              >
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Regular Updates</h3>
              <p className="text-gray-800 dark:text-gray-200">Stay on track with regular check-ins and supplement adjustments.</p>
            </motion.div>
          </StaggerItem>
        </div>
      </StaggerContainer>

      {/* How It Works Section - Refined animations */}
      <AnimatedSection delay={0.3} threshold={0.2} animation="scaleUp" viewport="0px 0px -15% 0px">
        <div className="py-16 sm:py-20 bg-transparent transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <ParallaxSection intensity={0.15}>
                <motion.h2 
                  className="text-3xl sm:text-4xl font-bold hero-gradient mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -120px 0px" }}
                  transition={{ 
                    duration: 0.9,
                    ease: [0.165, 0.84, 0.44, 1]
                  }}
                >
                  How Swallow Hero Works
                </motion.h2>
                <motion.p 
                  className="text-lg text-gray-800 dark:text-gray-200 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "0px 0px -120px 0px" }}
                  transition={{ 
                    duration: 0.9, 
                    delay: 0.2,
                    ease: "easeOut" 
                  }}
                >
                  Your journey to optimal health starts here
                </motion.p>
              </ParallaxSection>
            </div>
            
            {/* Steps section with grid */}
            <div className="relative py-8">
              {/* Fixed Connecting Line with static colors - adjusted to be centered */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 z-0 transform -translate-y-1/2"></div>
              
              {/* Step Cards in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="relative z-10">
                  <motion.div 
                    className="rounded-xl p-8 shadow-lg relative bg-white dark:bg-gray-800 border border-sky-100 dark:border-sky-800"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      transition: { type: "spring", stiffness: 300, damping: 15 }
                    }}
                  >
                    <motion.div 
                      className="absolute -top-5 left-0 right-0 mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-20"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
                    >
                      1
                    </motion.div>
                    <div className="mt-8 text-center">
                      <motion.div 
                        className="w-20 h-20 mx-auto mb-6 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center"
                        whileHover={{ rotate: 8, scale: 1.08 }}
                      >
                        <svg className="w-10 h-10 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Chat with AI</h3>
                      <p className="text-gray-800 dark:text-gray-200">
                        Tell us about your health goals, lifestyle, and current supplements. Our AI analyzes your unique needs.
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Step 2 */}
                <div className="relative z-10">
                  <motion.div 
                    className="rounded-xl p-8 shadow-lg relative bg-white dark:bg-gray-800 border border-teal-100 dark:border-teal-800"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      transition: { type: "spring", stiffness: 300, damping: 15 }
                    }}
                  >
                    <motion.div 
                      className="absolute -top-5 left-0 right-0 mx-auto w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-20"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.6 }}
                    >
                      2
                    </motion.div>
                    <div className="mt-8 text-center">
                      <motion.div 
                        className="w-20 h-20 mx-auto mb-6 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center"
                        whileHover={{ rotate: 8, scale: 1.08 }}
                      >
                        <svg className="w-10 h-10 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Get Recommendations</h3>
                      <p className="text-gray-800 dark:text-gray-200">
                        Receive scientifically-backed supplement recommendations tailored specifically for you.
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Step 3 */}
                <div className="relative z-10">
                  <motion.div 
                    className="rounded-xl p-8 shadow-lg relative bg-white dark:bg-gray-800 border border-green-100 dark:border-green-800"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.7 }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      transition: { type: "spring", stiffness: 300, damping: 15 }
                    }}
                  >
                    <motion.div 
                      className="absolute -top-5 left-0 right-0 mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-20"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.8 }}
                    >
                      3
                    </motion.div>
                    <div className="mt-8 text-center">
                      <motion.div 
                        className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
                        whileHover={{ rotate: 8, scale: 1.08 }}
                      >
                        <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Track Progress</h3>
                      <p className="text-gray-800 dark:text-gray-200">
                        Monitor your health journey with regular check-ins and optimize your supplement routine.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="text-center mt-16 mb-16">
              <motion.button 
                onClick={() => navigate('/chat')}
                className="btn-primary btn-lg group hover:shadow-lg"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.15)" 
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -120px 0px" }}
                transition={{ 
                  duration: 0.7, 
                  delay: 1.0,
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }}
              >
                Start Your Journey
                <motion.svg 
                  className="w-5 h-5 icon-right" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  initial={{ x: 0 }}
                  whileHover={{ x: 6 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 10 
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </motion.button>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Subscription Plans - Refined reveal with earlier trigger */}
      <AnimatedSection delay={0.3} threshold={0.15} animation="slideUp" viewport="0px 0px -5% 0px">
        <div className="pt-8 pb-16 sm:pt-12 sm:pb-24 bg-transparent transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SubscriptionPlans />
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Home; 