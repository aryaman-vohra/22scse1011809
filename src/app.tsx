// src/App.tsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Routes } from 'react-router'; // Import Routes from react-router
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import UrlShortenerPage from './pages/UrlShortenerPage';
import StatisticsPage from './pages/StatisticsPage';
import RedirectHandler from './components/RedirectHandler';
import Navigation from './components/Navigation';
import { logger } from './utils/logging';
import config, { validateConfig } from './config';
import './app.css';


const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  useEffect(() => {
    const initialize = async () => {
      // Validate configuration
      const configErrors = validateConfig();
      if (configErrors.length > 0) {
        console.error('Configuration errors:', configErrors);
        await logger.error('config', `Configuration validation failed: ${configErrors.join(', ')}`);
      }

      // Set up authentication token for logging from environment variables
      const authToken = config.testServer.accessToken;
      if (authToken) {
        logger.setAuthToken(authToken);
        await logger.info('config', 'Authentication token configured for logging');
      } else {
        await logger.warn('config', 'No authentication token found in environment variables');
      }

      await logger.info('config', 'URL Shortener application initialized');

      // Clean up expired URLs on app start
      try {
        const { StorageService } = await import('./utils/storageService');
        StorageService.clearExpiredUrls();
        await logger.info('config', 'Expired URLs cleanup completed');
      } catch (error) {
        await logger.error('config', 'Failed to clean up expired URLs on startup');
      }
    };

    initialize();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navigation />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/" element={<UrlShortenerPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/:shortCode" element={<RedirectHandler />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
