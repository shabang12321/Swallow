import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import SubscriptionPlans from '../components/SubscriptionPlans';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <div className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 hero-gradient px-2">
              Your Personal Supplement Hero
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              Chat with our AI to discover the perfect supplements for your health journey.
              Get personalized recommendations based on your unique needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4">
              <button 
                onClick={() => navigate('/chat')} 
                className="btn-primary w-full sm:w-auto"
              >
                Try AI Chat
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="px-6 py-3 text-gray-700 rounded-lg border border-gray-300 
                          hover:border-green-500 hover:text-green-600 transition-all duration-200
                          w-full sm:w-auto"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4">
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Advice</h3>
              <p className="text-gray-600">Get tailored supplement recommendations based on your unique health profile.</p>
            </div>
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Results</h3>
              <p className="text-gray-600">Instant AI-powered analysis and recommendations for your health goals.</p>
            </div>
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Regular Updates</h3>
              <p className="text-gray-600">Stay on track with regular check-ins and supplement adjustments.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="bg-white py-12 sm:py-20">
        <SubscriptionPlans />
      </div>
    </div>
  );
};

export default Home; 