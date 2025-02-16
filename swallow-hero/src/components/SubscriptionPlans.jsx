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
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Get personalized vitamin recommendations and regular deliveries tailored to your needs
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative rounded-2xl bg-white overflow-hidden transition-all duration-300
              ${plan.highlight 
                ? 'shadow-2xl ring-2 ring-sky-500 transform hover:-translate-y-2 md:scale-105' 
                : 'shadow-xl hover:shadow-2xl transform hover:-translate-y-2'}`}
          >
            {plan.highlight && (
              <div className="absolute top-0 inset-x-0">
                <div className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-4 py-2 text-sm font-medium text-center transform">
                  Most Popular
                </div>
              </div>
            )}
            <div className={`p-6 sm:p-8 ${plan.highlight ? 'pt-12' : ''}`}>
              <div className="flex flex-col items-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl sm:text-5xl font-bold text-sky-600">{plan.price}</span>
                  <span className="text-gray-500 ml-2 text-base sm:text-lg">/{plan.period}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6">
                <ul className="space-y-3 sm:space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg 
                        className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" 
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
                      <span className="text-sm sm:text-base text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-base sm:text-lg font-semibold transition-all duration-200 
                  ${plan.highlight
                    ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white hover:from-sky-600 hover:to-teal-600 shadow-lg hover:shadow-xl'
                    : 'bg-white border-2 border-sky-500 text-sky-600 hover:bg-sky-50'
                  }`}
              >
                Get Started
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-gray-500 text-sm mt-8">
        All plans include a 30-day money-back guarantee
      </div>
    </div>
  );
};

export default SubscriptionPlans; 