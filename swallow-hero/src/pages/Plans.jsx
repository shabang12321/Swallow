import React from 'react';
import SubscriptionPlans from '../components/SubscriptionPlans';
import { Link } from 'react-router-dom';

const Plans = () => {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Content */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 hero-gradient">
              Choose Your Perfect Plan
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200 mb-16">
              Select the plan that best fits your needs. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Secure & Flexible */}
            <div className="text-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              style={{ 
                isolation: 'isolate',
                position: 'relative',
                zIndex: 1
              }}
            >
              <div className="relative z-2">
                <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-sky-500 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Secure & Flexible</h3>
                <p className="text-gray-600 dark:text-gray-300">Cancel or change your plan anytime. No long-term commitments.</p>
              </div>
            </div>

            {/* Instant Access */}
            <div className="text-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              style={{ 
                isolation: 'isolate',
                position: 'relative',
                zIndex: 1
              }}
            >
              <div className="relative z-2">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Instant Access</h3>
                <p className="text-gray-600 dark:text-gray-300">Start chatting with our AI immediately after subscribing.</p>
              </div>
            </div>

            {/* 100% Satisfaction */}
            <div className="text-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              style={{ 
                isolation: 'isolate',
                position: 'relative',
                zIndex: 1
              }}
            >
              <div className="relative z-2">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">100% Satisfaction</h3>
                <p className="text-gray-600 dark:text-gray-300">Try risk-free with our money-back guarantee.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SubscriptionPlans />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-8 hero-gradient">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="faq-card p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl"
            style={{ 
              isolation: 'isolate',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div className="relative z-2">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Can I change my plan later?</h3>
              <p className="text-gray-700 dark:text-gray-300">Yes, you can upgrade, downgrade, or cancel your plan at any time from your account settings.</p>
            </div>
          </div>
          <div className="faq-card p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl"
            style={{ 
              isolation: 'isolate',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div className="relative z-2">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">What payment methods do you accept?</h3>
              <p className="text-gray-700 dark:text-gray-300">We accept all major credit cards, PayPal, and other secure payment methods.</p>
            </div>
          </div>
          <div className="faq-card p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl"
            style={{ 
              isolation: 'isolate',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div className="relative z-2">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Is there a free trial?</h3>
              <p className="text-gray-700 dark:text-gray-300">Yes, you can try our basic features for free to see if Swallow Hero is right for you.</p>
            </div>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link 
            to="/faq" 
            className="btn-primary inline-flex items-center"
          >
            View All FAQs
            <svg 
              className="w-5 h-5 icon-right" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Plans; 