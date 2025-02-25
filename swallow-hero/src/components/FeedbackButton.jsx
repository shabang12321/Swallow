import React, { useState, useEffect } from 'react';
import { useForm, ValidationError } from '@formspree/react';

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, handleSubmit, reset] = useForm("xeoevzbw");
  const [showThankYou, setShowThankYou] = useState(false);

  // Handle successful submission
  useEffect(() => {
    if (state.succeeded) {
      setShowThankYou(true);
      
      // Reset the form after 10 seconds
      const resetTimer = setTimeout(() => {
        reset();
        setShowThankYou(false);
      }, 10000);
      
      return () => clearTimeout(resetTimer);
    }
  }, [state.succeeded, reset]);

  // Handle modal close
  const handleClose = () => {
    if (showThankYou) {
      // If thank you message is showing, reset the form when closing
      reset();
      setShowThankYou(false);
    }
    setIsOpen(false);
  };

  // Handle submitting new feedback after thank you
  const handleNewFeedback = () => {
    reset();
    setShowThankYou(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
        aria-label="Give feedback"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
          Give Feedback
        </span>
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6 transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {showThankYou ? (
              <div className="text-center py-6">
                <svg
                  className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Thank You!</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200 mb-6">Your feedback helps us improve Swallow Hero.</p>
                <button
                  onClick={handleNewFeedback}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Submit More Feedback
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                  Super Appreciative of all Feedback!
                </h2>
                <textarea
                  id="message"
                  name="message"
                  placeholder="We appreciate any feedback that helps us make Swallow Hero better for everyone..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-700 focus:border-sky-500 dark:focus:border-sky-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-colors duration-200"
                  disabled={state.submitting}
                  required
                />
                <ValidationError 
                  prefix="Message" 
                  field="message"
                  errors={state.errors}
                  className="text-red-500 dark:text-red-400 text-sm"
                />
                <button
                  type="submit"
                  disabled={state.submitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.submitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Feedback'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton; 