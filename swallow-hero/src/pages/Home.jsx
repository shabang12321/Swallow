import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionPlans from '../components/SubscriptionPlans';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 hero-gradient px-2">
              Your Personal Supplement Hero
            </h1>
            <p className="text-lg sm:text-xl text-gray-800 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              Chat with our AI to discover the perfect supplements for your health journey.
              Get personalized recommendations based on your unique needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4">
              <button 
                onClick={() => navigate('/chat')} 
                className="btn-primary btn-lg"
              >
                Try AI Chat
                <svg className="w-5 h-5 icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="btn-outline text-sky-600 hover:text-sky-700"
              >
                Learn More
                <svg className="w-5 h-5 icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
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
              <p className="text-gray-800">Get tailored supplement recommendations based on your unique health profile.</p>
            </div>
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Results</h3>
              <p className="text-gray-800">Instant AI-powered analysis and recommendations for your health goals.</p>
            </div>
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Regular Updates</h3>
              <p className="text-gray-800">Stay on track with regular check-ins and supplement adjustments.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gradient-to-br from-sky-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold hero-gradient mb-4">How Swallow Hero Works</h2>
            <p className="text-lg text-gray-800 max-w-2xl mx-auto">
              Your journey to optimal health starts here
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Enhanced Connecting Lines (visible on md+ screens) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full">
              <div className="h-1 bg-gradient-to-r from-sky-200 via-teal-200 to-green-200 transform -translate-y-1/2 rounded-full shadow-sm"></div>
              <div className="h-0.5 bg-gradient-to-r from-sky-100 via-teal-100 to-green-100 transform translate-y-0.5 blur-sm"></div>
            </div>
            
            {/* Step 1 */}
            <div className="rounded-xl p-8 shadow-lg relative transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-sky-100" style={{ backgroundColor: '#FFFFFF', isolation: 'isolate', position: 'relative', zIndex: 1 }}>
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-sky-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                1
              </div>
              <div className="mt-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-sky-100 rounded-full flex items-center justify-center transform transition-transform duration-300 group-hover:rotate-6">
                  <svg className="w-10 h-10 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Chat with AI</h3>
                <p className="text-gray-800">
                  Tell us about your health goals, lifestyle, and current supplements. Our AI analyzes your unique needs.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl p-8 shadow-lg relative transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-teal-100" style={{ backgroundColor: '#FFFFFF', isolation: 'isolate', position: 'relative', zIndex: 1 }}>
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                2
              </div>
              <div className="mt-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-teal-100 rounded-full flex items-center justify-center transform transition-transform duration-300 group-hover:rotate-6">
                  <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Get Recommendations</h3>
                <p className="text-gray-800">
                  Receive scientifically-backed supplement recommendations tailored specifically for you.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl p-8 shadow-lg relative transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-green-100" style={{ backgroundColor: '#FFFFFF', isolation: 'isolate', position: 'relative', zIndex: 1 }}>
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                3
              </div>
              <div className="mt-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center transform transition-transform duration-300 group-hover:rotate-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Track Progress</h3>
                <p className="text-gray-800">
                  Monitor your health journey with regular check-ins and optimize your supplement routine.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <button 
              onClick={() => navigate('/chat')}
              className="btn-primary btn-lg group"
            >
              Start Your Journey
              <svg 
                className="w-5 h-5 icon-right" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="py-12 sm:py-20 bg-gradient-to-br from-sky-50 to-emerald-50">
        <SubscriptionPlans />
      </div>
    </div>
  );
};

export default Home; 