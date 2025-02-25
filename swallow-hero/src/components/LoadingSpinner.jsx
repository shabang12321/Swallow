import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="w-12 h-12 rounded-full border-t-4 border-l-4 border-r-4 border-transparent absolute top-0 left-0 animate-spin">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 opacity-30 absolute"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 