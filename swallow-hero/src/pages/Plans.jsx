import React from 'react';
import SubscriptionPlans from '../components/SubscriptionPlans';

const Plans = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the plan that best fits your needs. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>
        <SubscriptionPlans />
      </div>
    </div>
  );
};

export default Plans; 