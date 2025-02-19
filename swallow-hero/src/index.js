import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Add error logging
console.log('Application Starting:', {
  environment: process.env.NODE_ENV,
  baseUrl: window.location.origin
});

const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.body.innerHTML = `
    <div style="height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; text-align: center;">
      <div>
        <h1 style="color: #e11d48; font-size: 24px; margin-bottom: 16px;">Something went wrong</h1>
        <p style="color: #4b5563;">${error.message}</p>
        <button 
          onclick="window.location.reload()" 
          style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          Reload Page
        </button>
      </div>
    </div>
  `;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
