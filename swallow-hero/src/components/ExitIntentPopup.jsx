import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const ExitIntentPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { profileTheme, getThemeGradient } = useTheme();
  
  const themeGradient = getThemeGradient(profileTheme);

  // Check if the popup has been shown in this session
  const [hasShown, setHasShown] = useState(() => {
    return localStorage.getItem('exitPopupShown') === 'true';
  });

  // For testing in development mode, automatically reset on reload
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('exitPopupShown');
      setHasShown(false);
    }
  }, []);

  // Simple, reliable exit intent detection
  useEffect(() => {
    if (hasShown) return;

    // DETECTION METHOD 1: Mouse leaving the window
    const handleMouseLeave = (e) => {
      // Check if the mouse is moving out the top of the page
      if (e.clientY <= 5) {
        setShowPopup(true);
        localStorage.setItem('exitPopupShown', 'true');
        setHasShown(true);
      }
    };

    // DETECTION METHOD 2: User inactivity
    let inactivityTimer;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (!hasShown) {
          setShowPopup(true);
          localStorage.setItem('exitPopupShown', 'true');
          setHasShown(true);
        }
      }, 60000); // 60 seconds of inactivity
    };

    // DETECTION METHOD 3: Fallback timer
    const fallbackTimer = setTimeout(() => {
      if (!hasShown) {
        setShowPopup(true);
        localStorage.setItem('exitPopupShown', 'true');
        setHasShown(true);
      }
    }, 90000); // 90 seconds

    // Initial timer setup
    resetInactivityTimer();

    // Events that reset inactivity timer
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // Add event listener for detecting mouse leaving the window
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      // Clean up all event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(inactivityTimer);
      clearTimeout(fallbackTimer);
    };
  }, [hasShown]);

  // Handle the click on the "Give Feedback" button
  const handleFeedbackClick = () => {
    // First close our popup
    setShowPopup(false);
    
    // From reviewing the FeedbackButton.jsx component, the button has these attributes:
    const feedbackButtonSelectors = [
      'button[aria-label="Give feedback"]',
      'button.fixed.bottom-6.right-6',
      '.group svg[viewBox="0 0 24 24"] + span:contains("Give Feedback")',
      'button.fixed svg path[d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"]'
    ];
    
    // Try to find the button based on our selectors
    let feedbackButton = null;
    
    // Since querySelector doesn't support complex selectors like :contains,
    // we need to query more generally and then filter
    for (const selector of feedbackButtonSelectors) {
      if (selector.includes(':contains')) {
        // Handle special case for text content
        const baseSelector = selector.split(':contains')[0];
        const textToMatch = selector.split(':contains("')[1].split('")')[0];
        
        const elements = document.querySelectorAll(baseSelector);
        for (const element of elements) {
          if (element.textContent.includes(textToMatch)) {
            feedbackButton = element.closest('button');
            break;
          }
        }
      } else {
        feedbackButton = document.querySelector(selector);
      }
      
      if (feedbackButton) break;
    }
    
    // If we still don't have a button, try a broader approach
    if (!feedbackButton) {
      // Look for any fixed positioned button at the bottom right
      const allButtons = document.querySelectorAll('button.fixed');
      for (const button of allButtons) {
        const computedStyle = window.getComputedStyle(button);
        if (computedStyle.bottom && computedStyle.right) {
          feedbackButton = button;
          break;
        }
      }
    }
    
    // If we found the button, click it
    if (feedbackButton) {
      console.log('Feedback button found:', feedbackButton);
      setTimeout(() => {
        feedbackButton.click();
      }, 100);
    } else {
      console.warn('Could not find feedback button - trying direct DOM manipulation');
      
      // Direct manipulation - create and append our own feedback modal
      // This is a last resort if we can't find the existing button
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6 transform border border-gray-200 dark:border-gray-700">
          <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Super Appreciative of all Feedback!
          </h2>
          <form class="space-y-4" action="https://formspree.io/f/xeoevzbw" method="POST">
            <textarea
              id="message"
              name="message"
              placeholder="We appreciate any feedback that helps us make Swallow Hero better for everyone..."
              class="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            ></textarea>
            <button
              type="submit"
              class="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-lg font-medium"
            >
              Send Feedback
            </button>
          </form>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add click handler to close button and backdrop
      setTimeout(() => {
        const closeButton = modal.querySelector('button');
        const backdrop = modal.querySelector('.absolute');
        
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
          });
        }
        
        if (backdrop) {
          backdrop.addEventListener('click', () => {
            document.body.removeChild(modal);
          });
        }
      }, 100);
    }
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setShowPopup(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-3 hero-gradient">Before You Go!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-5">
              We'd love to hear about your experience on our site.
            </p>

            <div className="flex justify-between items-center">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => setShowPopup(false)}
              >
                Maybe Later
              </button>
              <button
                type="button"
                onClick={handleFeedbackClick}
                className={`px-6 py-2 rounded-lg text-white bg-gradient-to-r ${themeGradient} hover:opacity-90 transition-opacity`}
              >
                Give Feedback
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup; 