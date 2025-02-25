import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 hero-gradient">
              About Swallow Hero
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-200">
              Your AI-powered supplement companion, combining cutting-edge technology with nutritional science for personalized wellness recommendations.
            </p>
          </div>

          {/* Core Values Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="card p-6 text-center hover:scale-105 transition-all duration-300">
              <div className="inline-block p-3 rounded-full bg-sky-100 dark:bg-sky-900/50 mb-4 transition-colors duration-200">
                <svg className="w-8 h-8 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">Evidence-Based</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                All recommendations backed by scientific research and clinical studies
              </p>
            </div>

            <div className="card p-6 text-center hover:scale-105 transition-all duration-300">
              <div className="inline-block p-3 rounded-full bg-teal-100 dark:bg-teal-900/50 mb-4 transition-colors duration-200">
                <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">Personalized</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                Tailored recommendations based on your unique health profile
              </p>
            </div>

            <div className="card p-6 text-center hover:scale-105 transition-all duration-300">
              <div className="inline-block p-3 rounded-full bg-green-100 dark:bg-green-900/50 mb-4 transition-colors duration-200">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">Instant Access</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                24/7 AI-powered guidance at your fingertips
              </p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="card p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center transition-colors duration-200">How Swallow Hero Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="inline-block p-3 rounded-full bg-sky-100 dark:bg-sky-900/50 mb-4 transition-colors duration-200">
                  <svg className="w-8 h-8 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">Profile Creation</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-200">Complete your health profile in minutes</p>
              </div>

              <div className="text-center">
                <div className="inline-block p-3 rounded-full bg-teal-100 dark:bg-teal-900/50 mb-4 transition-colors duration-200">
                  <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">AI Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-200">Get instant personalized recommendations</p>
              </div>

              <div className="text-center">
                <div className="inline-block p-3 rounded-full bg-green-100 dark:bg-green-900/50 mb-4 transition-colors duration-200">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">Ongoing Support</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-200">Chat anytime for guidance and updates</p>
              </div>

              <div className="text-center">
                <div className="inline-block p-3 rounded-full bg-sky-100 dark:bg-sky-900/50 mb-4 transition-colors duration-200">
                  <svg className="w-8 h-8 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">Regular Updates</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-200">Adjust recommendations as your needs change</p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors duration-200">Why Choose Us</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-lg transition-colors duration-200">
                    <svg className="w-6 h-6 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">Advanced AI Technology</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">State-of-the-art algorithms for accurate recommendations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg transition-colors duration-200">
                    <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">Real-Time Updates</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Stay current with the latest supplement research</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg transition-colors duration-200">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">Safety First</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Comprehensive interaction checks and safety guidelines</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors duration-200">Our Expertise</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-lg transition-colors duration-200">
                    <svg className="w-6 h-6 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">Research Database</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Access to extensive scientific studies and clinical trials</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg transition-colors duration-200">
                    <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">Educational Resources</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Comprehensive guides and learning materials</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg transition-colors duration-200">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">Community Support</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Join a community of health-conscious individuals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="card text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">Ready to Start Your Journey?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto transition-colors duration-200">
              Join thousands of users who have discovered their perfect supplement routine with Swallow Hero.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/chat" className="btn-primary">
                Try AI Chat Now
                <svg className="w-5 h-5 icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/plans" className="btn-outline text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
                View Plans
                <svg className="w-5 h-5 icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 