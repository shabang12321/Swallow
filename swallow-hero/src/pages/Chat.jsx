import React from 'react';
import Navigation from '../components/Navigation';
import ChatInterface from '../components/ChatInterface';

const Chat = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navigation />
      
      {/* Chat Header */}
      <div className="py-8 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4 hero-gradient">
            AI Supplement Advisor
          </h1>
          <p className="text-lg text-gray-600">
            Chat with our AI to get personalised supplement recommendations and advice
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <ChatInterface />
        </div>
      </div>

      {/* Tips Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">Tips for Better Results</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Be specific about your health goals</li>
              <li>• Mention any existing conditions or medications</li>
              <li>• Share your dietary preferences</li>
              <li>• Ask follow-up questions for clarity</li>
            </ul>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">Important Note</h3>
            <p className="text-gray-600">
              Our AI provides general recommendations based on available information. 
              Always consult with a healthcare professional before starting any new supplement regimen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 