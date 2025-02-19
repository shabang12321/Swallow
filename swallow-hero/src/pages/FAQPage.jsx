import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQSection = ({ title, faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <span className="font-medium text-gray-900 pr-8">{faq.question}</span>
              <svg
                className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 flex-shrink-0 ${
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
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FAQPage = () => {
  console.log('FAQPage component rendering');
  const faqData = {
    about: {
      title: "About Swallow Hero",
      faqs: [
        {
          question: "What is Swallow Hero AI?",
          answer: "Swallow Hero AI is an intelligent supplement advisor that provides personalized vitamin and supplement recommendations based on your individual health profile, lifestyle, and wellness goals. Using advanced AI technology, we analyze your specific needs to create tailored supplement plans."
        },
        {
          question: "How does the AI recommendation system work?",
          answer: "Our AI system analyzes multiple factors including your age, gender, diet, lifestyle, health concerns, and current medications. It then cross-references this information with a vast database of scientific research to provide personalized supplement recommendations that are both safe and effective."
        },
        {
          question: "Is Swallow Hero a replacement for medical advice?",
          answer: "No, Swallow Hero is not a replacement for professional medical advice. While we provide evidence-based supplement recommendations, you should always consult with your healthcare provider before starting any new supplement regimen, especially if you have existing medical conditions or take medications."
        }
      ]
    },
    recommendations: {
      title: "Supplement Recommendations",
      faqs: [
        {
          question: "How personalized are the recommendations?",
          answer: "Our recommendations are highly personalized, taking into account your unique health profile, including age, gender, lifestyle, diet, health concerns, and current medications. The AI considers multiple factors to create a supplement plan tailored specifically to your needs."
        },
        {
          question: "How often should I update my recommendations?",
          answer: "We recommend updating your health profile every 3-6 months, or whenever you experience significant changes in your health, lifestyle, or medications. Regular updates ensure your supplement recommendations remain optimally aligned with your current needs."
        },
        {
          question: "Are the recommended supplements scientifically backed?",
          answer: "Yes, all our supplement recommendations are based on peer-reviewed scientific research and established nutritional guidelines. We continuously update our database with the latest research to ensure our recommendations reflect current scientific understanding."
        }
      ]
    },
    safety: {
      title: "Safety & Usage",
      faqs: [
        {
          question: "Are there any risks to taking supplements?",
          answer: "While supplements are generally safe when taken as recommended, they can interact with medications or be contraindicated for certain medical conditions. This is why we emphasize the importance of consulting with your healthcare provider and always following recommended dosages."
        },
        {
          question: "What if I experience side effects?",
          answer: "If you experience any adverse effects, discontinue use immediately and consult your healthcare provider. It's important to report any serious side effects to both your healthcare provider and the supplement manufacturer."
        },
        {
          question: "Can I take multiple supplements together?",
          answer: "While many supplements can be taken together, some may interact with each other or with medications. Our AI considers potential interactions when making recommendations, but you should always consult your healthcare provider about your complete supplement regimen."
        }
      ]
    },
    usage: {
      title: "Using Swallow Hero",
      faqs: [
        {
          question: "How do I get started?",
          answer: "Getting started is easy! Simply complete our health questionnaire, which takes about 5 minutes. Our AI will then analyze your responses and provide personalized supplement recommendations tailored to your needs."
        },
        {
          question: "Can I modify my health profile?",
          answer: "Yes, you can update your health profile at any time. We recommend reviewing and updating your information every 3-6 months or whenever there are significant changes in your health, lifestyle, or medications."
        },
        {
          question: "Is my health information secure?",
          answer: "Yes, we take your privacy seriously. All health information is encrypted and stored securely. We never share your personal data with third parties, and we comply with all relevant data protection regulations."
        }
      ]
    }
  };

  return (
    <div className="flex-1">
      <div className="bg-gradient-to-br from-sky-50 to-emerald-50 min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <header className="text-center mb-12">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-teal-500">
                Frequently Asked Questions
              </h1>
              <p className="text-gray-600 mt-4">
                Find answers to common questions about Swallow Hero AI and supplement recommendations
              </p>
            </header>

            {Object.values(faqData).map((section, index) => (
              <FAQSection key={index} title={section.title} faqs={section.faqs} />
            ))}

            <footer className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Still have questions?{' '}
                <Link to="/chat" className="text-sky-500 hover:text-sky-600 font-medium">
                  Chat with our AI support
                </Link>{' '}
                or{' '}
                <button className="text-sky-500 hover:text-sky-600 font-medium">
                  contact our team
                </button>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage; 