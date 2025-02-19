import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ChatInterface from './components/ChatInterface';
import FAQPage from './pages/FAQPage';

const App = () => {
  console.log("App rendering");
  
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<ChatInterface />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/faq" element={
          <div className="pt-16">
            <FAQPage />
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App; 