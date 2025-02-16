import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-50">
      {/* Hero Section */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 hero-gradient">
              About Swallow Hero
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering you with AI-driven nutrition guidance for a healthier lifestyle. 
              We combine cutting-edge technology with nutritional science to provide 
              personalized supplement recommendations.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600">
                At Swallow Hero, we're committed to making personalized nutrition advice accessible to everyone. 
                Our AI-powered platform democratizes access to expert-level supplement guidance, helping you 
                make informed decisions about your health.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
              <ul className="space-y-4 text-lg text-gray-600">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-teal-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced AI technology for personalized recommendations</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-teal-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>24/7 instant support and guidance</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-teal-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Evidence-based recommendations</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm transform hover:scale-105 transition-transform duration-300">
              <div className="text-sky-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Smart Analysis</h3>
              <p className="text-gray-600 text-center">
                Our AI analyzes your health profile to provide tailored supplement recommendations.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm transform hover:scale-105 transition-transform duration-300">
              <div className="text-teal-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Real-time Updates</h3>
              <p className="text-gray-600 text-center">
                Get instant recommendations and adjust your supplement routine as needed.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm transform hover:scale-105 transition-transform duration-300">
              <div className="text-purple-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Expert Support</h3>
              <p className="text-gray-600 text-center">
                Access to AI-powered nutritional guidance whenever you need it.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of users who have already discovered their perfect supplement routine with Swallow Hero.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/chat" 
                className="btn-primary"
              >
                Try AI Chat Now
              </Link>
              <Link 
                to="/plans" 
                className="px-6 py-3 text-gray-700 rounded-lg border border-gray-300 
                          hover:border-sky-500 hover:text-sky-600 transition-all duration-200"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 