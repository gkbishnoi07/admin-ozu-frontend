import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Load Google Maps API
const loadGoogleMapsAPI = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ Google Maps API key not configured. Location search will not work.');
    console.warn('Please set VITE_GOOGLE_MAPS_API_KEY in your .env file');
    return;
  }

  if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=Function.prototype`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('❌ Failed to load Google Maps API. Please check your API key.');
    };
    document.head.appendChild(script);
  }
};

loadGoogleMapsAPI();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


