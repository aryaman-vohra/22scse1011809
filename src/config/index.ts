// src/config/index.ts

import { Log } from '../utils/logging';

export const config = {
  // Test Server Configuration
  testServer: {
    baseUrl: process.env.REACT_APP_TEST_SERVER_URL || 'http://20.244.56.144/evaluation-service',
    clientId: process.env.REACT_APP_CLIENT_ID || '',
    clientSecret: process.env.REACT_APP_CLIENT_SECRET || '',
    accessToken: process.env.REACT_APP_ACCESS_TOKEN || '',
  },

  // Application Configuration
  app: {
    baseUrl: process.env.REACT_APP_BASE_URL || 'http://localhost:3000',
    port: parseInt(process.env.PORT || '3000', 10),
    debugMode: process.env.REACT_APP_DEBUG_LOGGING === 'true',
  },

  // URL Shortener Configuration
  urlShortener: {
    defaultValidityMinutes: 30,
    maxConcurrentUrls: 5,
    shortCodeLength: 6,
    maxShortCodeLength: 10,
    minShortCodeLength: 4,
    maxValidityMinutes: 525600, // 1 year
  },

  // Storage Configuration
  storage: {
    urlsKey: 'url_shortener_urls',
    clicksKey: 'url_shortener_clicks',
  },

  // External Services
  services: {
    geoLocationApi: 'https://ipapi.co/json/',
  },
};

// Validation function to check if required env vars are present
export const validateConfig = (): string[] => {
  const errors: string[] = [];

  if (!config.testServer.baseUrl) {
    errors.push('REACT_APP_TEST_SERVER_URL is required');
  }

  // Optional: Log each error using your custom middleware
  errors.forEach(error =>
    Log('frontend', 'fatal', 'config', error)
  );

  return errors;
};

export default config;
