import React, { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import { StorageService } from '../utils/storageService';
import { UrlUtils } from '../utils/urlUtils';
import { UrlData, ClickData } from '../types';
import { logger } from '../utils/logging';

const StatisticsPage: React.FC = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);

  useEffect(() => {
    const loadedUrls = StorageService.loadUrls();
    setUrls(loadedUrls);
    logger.info('page', `Loaded ${loadedUrls.length} URLs for statistics`);
  }, []);

  const renderClicks = (clicks: ClickData[]) => {
    return clicks.map((click, index) => (
      <ListItem key={index} sx={{ pl: 4 }}>
        <ListItemText
          primary={`${UrlUtils.formatDateTime(new Date(click.timestamp))} — ${click.source}`}
          secondary={`City: ${click.city || 'Unknown'}, Country: ${click.country || 'Unknown'}`}
        />
      </ListItem>
    ));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        URL Shortener Statistics
      </Typography>
      {urls.length === 0 ? (
        <Typography>No shortened URLs found.</Typography>
      ) : (
        <List>
          {urls.map((url) => (
            <Paper key={url.id} sx={{ mb: 2, p: 2 }}>
              <Typography variant="h6">
                <Tooltip title="Click to visit">
                  <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: '#1976d2' }}
                  >
                    {url.shortUrl}
                  </a>
                </Tooltip>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Original URL: {url.originalUrl}
              </Typography>
              <Box mt={1} mb={1}>
                <Chip label={`Created: ${UrlUtils.formatDateTime(new Date(url.createdAt))}`} sx={{ mr: 1 }} />
                <Chip label={`Expires: ${UrlUtils.formatDateTime(new Date(url.expiresAt))}`} sx={{ mr: 1 }} />
                <Chip label={`Clicks: ${url.clickCount}`} color="primary" />
              </Box>
              <Divider sx={{ mt: 2, mb: 1 }} />
              <Typography variant="subtitle1">Click Details:</Typography>
              {url.clicks.length === 0 ? (
                <Typography variant="body2" color="textSecondary">No clicks recorded.</Typography>
              ) : (
                <List disablePadding>{renderClicks(url.clicks)}</List>
              )}
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default StatisticsPage;
