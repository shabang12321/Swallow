import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQSection = ({ title, icon, faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-sky-100 to-teal-100 dark:from-sky-900/30 dark:to-teal-900/30 transition-colors duration-200">
          {icon}
        </div>
        <h2 className="text-2xl font-bold hero-gradient">{title}</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="faq-card border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 relative z-2"
            >
              <div className="flex items-center gap-3">
                <div className="text-sky-500 dark:text-sky-400">
                  {faq.icon}
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100 text-lg">{faq.question}</span>
              </div>
              <svg
                className={`w-6 h-6 text-sky-500 dark:text-sky-400 transform transition-transform duration-200 flex-shrink-0 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 relative z-2 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-200">
                <p className="text-gray-700 dark:text-gray-300 text-lg">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FAQPage = () => {
  const faqData = {
    about: {
      title: "About Swallow Hero",
      icon: (
        <svg className="w-6 h-6 text-sky-600 dark:text-sky-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      faqs: [
        {
          question: "What is Swallow Hero AI?",
          answer: "AI-powered supplement advisor providing personalized recommendations based on your health profile.",
          icon: <svg className="w-5 h-5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        },
        {
          question: "How accurate are the recommendations?",
          answer: "Recommendations are based on scientific research and continuously updated with the latest studies.",
          icon: <svg className="w-5 h-5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        },
        {
          question: "Is this a replacement for medical advice?",
          answer: "NO! Always consult healthcare providers before starting new supplements.",
          icon: <svg className="w-5 h-5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      ]
    },
    recommendations: {
      title: "Supplement Advice",
      icon: (
        <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      faqs: [
        {
          question: "How personalized are the recommendations?",
          answer: "Fully customized based on age, gender, lifestyle, diet, health concerns, and medications.",
          icon: <svg className="w-5 h-5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        },
        {
          question: "How often should I update my profile?",
          answer: "Every 3 months or when health conditions change considerably.",
          icon: <svg className="w-5 h-5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        }
      ]
    },
    safety: {
      title: "Safety & Usage",
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      faqs: [
        {
          question: "Are supplements safe to take?",
          answer: "Generally safe when following recommended dosages. Always check with healthcare provider first.",
          icon: <svg className="w-5 h-5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
          </svg>
        },
        {
          question: "What about interactions?",
          answer: "Our AI checks for known supplement and medication interactions. Always inform your doctor.",
          icon: <svg className="w-5 h-5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        }
      ]
    },
    getting_started: {
      title: "Getting Started",
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      faqs: [
        {
          question: "How do I begin?",
          answer: "Complete 5-minute health questionnaire, get instant AI recommendations.",
          icon: <svg className="w-5 h-5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        },
        {
          question: "Is my data secure?",
          answer: "Yes. All data is encrypted and never shared with third parties.",
          icon: <svg className="w-5 h-5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      ]
    }
  };

  return (
    <div className="flex-1">
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow bg-white dark:bg-gray-800 transition-colors duration-200">
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold hero-gradient mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">
                Quick answers to common questions
              </p>
            </header>

            <div className="space-y-8">
              {Object.values(faqData).map((section, index) => (
                <FAQSection key={index} {...section} />
              ))}
            </div>

            <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/chat" className="btn-primary btn-lg group">
                  Chat with AI
                  <svg className="w-5 h-5 icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link to="/about" className="btn-outline text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors duration-200">
                  Learn More
                  <svg className="w-5 h-5 icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage; 