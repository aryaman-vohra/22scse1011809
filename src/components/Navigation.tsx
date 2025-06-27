// src/components/Navigation.tsx

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        <Box>
          <Button
            component={RouterLink}
            to="/"
            color="inherit"
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            sx={{ marginRight: 1 }}
          >
            Shorten URLs
          </Button>
          <Button
            component={RouterLink}
            to="/statistics"
            color="inherit"
            variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
          >
            Statistics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
