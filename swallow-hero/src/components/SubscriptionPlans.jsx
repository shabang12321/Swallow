import React from 'react';

const plans = [
  {
    name: 'Basic',
    price: 29,
    period: 'month',
    highlight: false,
    features: [
      'Monthly vitamin box',
      'Basic health assessment',
      'Email support',
      'Monthly health tips'
    ]
  },
  {
    name: 'Premium',
    price: 49,
    period: 'month',
    highlight: true,
    features: [
      'Monthly vitamin box',
      'Advanced health assessment',
      'Priority support',
      'Weekly health tips',
      'Quarterly consultation'
    ]
  },
  {
    name: 'Family',
    price: 89,
    period: 'month',
    highlight: false,
    features: [
      'Monthly vitamin boxes for 4',
      'Family health assessment',
      '24/7 support',
      'Weekly health tips',
      'Monthly consultation'
    ]
  }
];

const SubscriptionPlans = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold hero-gradient mb-4">Choose Your Plan</h2>
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto px-4">
          Get personalized vitamin recommendations and regular deliveries tailored to your needs
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative rounded-2xl overflow-hidden transition-all duration-300
              ${plan.highlight 
                ? 'shadow-2xl ring-2 ring-sky-500 transform hover:-translate-y-2 md:scale-105' 
                : 'shadow-xl hover:shadow-2xl transform hover:-translate-y-2'} 
              bg-white dark:bg-gray-800`}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0 z-10 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-6 py-1 text-sm font-medium 
                               transform rotate-0 shadow-md rounded-bl-xl translate-y-0 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Best Value
                </div>
              </div>
            )}
            <div className="p-6 sm:p-8 relative z-2">
              <div className="flex flex-col items-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl sm:text-5xl font-bold text-sky-700 dark:text-sky-400">{plan.price}</span>
                  <span className="text-gray-700 dark:text-gray-300 ml-2 text-base sm:text-lg">/{plan.period}</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6 mb-6">
                <ul className="space-y-3 sm:space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg 
                        className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2.5" 
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                className={`btn-full ${plan.highlight
                  ? 'btn-primary'
                  : 'btn-outline'
                }`}
              >
                Get Started
                <svg className="w-5 h-5 icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-gray-700 dark:text-gray-300 text-sm mt-8">
        All plans include a 7-day money-back guarantee
      </div>
    </div>
  );
};

export default SubscriptionPlans; 