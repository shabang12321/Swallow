import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ScrollToTop from './components/ScrollToTop';
import FeedbackButton from './components/FeedbackButton';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Plans from './pages/Plans';
import About from './pages/About';
import FAQPage from './pages/FAQPage';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQPage />} />
          </Routes>
        </main>
        <FeedbackButton />
      </div>
    </Router>
  );
}

export default App;
