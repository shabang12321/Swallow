import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xl font-bold hero-gradient">Swallow Hero</span>
            </Link>
          </div>
          <div className="flex items-center space-x-1">
            <Link to="/" className={`nav-link ${isActive('/') ? 'bg-sky-50 text-sky-600' : ''}`}>
              Home
            </Link>
            <Link to="/chat" className={`nav-link ${isActive('/chat') ? 'bg-sky-50 text-sky-600' : ''}`}>
              AI Chat
            </Link>
            <Link to="/plans" className={`nav-link ${isActive('/plans') ? 'bg-sky-50 text-sky-600' : ''}`}>
              Plans
            </Link>
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'bg-sky-50 text-sky-600' : ''}`}>
              About
            </Link>
            <Link to="/chat" className="btn-primary ml-4">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 