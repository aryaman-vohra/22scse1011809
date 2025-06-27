import React, { useState } from 'react';
import {
  Button, Card, CardContent, Grid, TextField, Typography, Divider, Alert
} from '@mui/material';
import { UrlUtils } from '../utils/urlUtils';
import { StorageService } from '../utils/storageService';
import { logger } from '../utils/logging';
import { UrlData } from '../types';
import { config } from '../config';

interface UrlInput {
  originalUrl: string;
  customShortCode: string;
  validityMinutes: string;
  errors: string[]; // corrected type
}

const UrlShortenerPage: React.FC = () => {
  const [urlInputs, setUrlInputs] = useState<UrlInput[]>(
    Array.from({ length: config.urlShortener.maxConcurrentUrls }, () => ({
      originalUrl: '',
      customShortCode: '',
      validityMinutes: '',
      errors: []
    }))
  );

  const [generatedUrls, setGeneratedUrls] = useState<UrlData[]>([]);

  const handleChange = (index: number, field: keyof UrlInput, value: string) => {
    if (field === 'errors') return; // Prevent updating errors via handleChange
    const updatedInputs = [...urlInputs];
    updatedInputs[index][field] = value as never; // Type assertion to satisfy TS, safe due to check above
    setUrlInputs(updatedInputs);
  };

  const handleSubmit = async () => {
    const updatedInputs = [...urlInputs];
    const existingCodes = StorageService.getAllShortCodes();
    const newUrls: UrlData[] = [];

    for (let i = 0; i < updatedInputs.length; i++) {
      const input = updatedInputs[i];
      const errors: string[] = [];

      // Validate fields
      const urlValidation = UrlUtils.validateUrl(input.originalUrl);
      const shortcodeValidation = UrlUtils.validateShortCode(input.customShortCode, existingCodes);
      const validityValidation = UrlUtils.validateValidityMinutes(input.validityMinutes);

      if (!urlValidation.isValid) errors.push(...urlValidation.errors);
      if (!shortcodeValidation.isValid) errors.push(...shortcodeValidation.errors);
      if (!validityValidation.isValid) errors.push(...validityValidation.errors);

      if (errors.length > 0) {
        updatedInputs[i].errors = errors;
        continue;
      }

      const validityMinutes = input.validityMinutes
        ? parseInt(input.validityMinutes, 10)
        : config.urlShortener.defaultValidityMinutes;

      const shortCode = input.customShortCode || UrlUtils.generateShortCode(existingCodes);
      const shortUrl = UrlUtils.createShortUrl(shortCode);
      const createdAt = new Date();
      const expiresAt = UrlUtils.calculateExpiryDate(validityMinutes);

      const newUrl: UrlData = {
        id: shortCode,
        originalUrl: input.originalUrl,
        shortCode,
        shortUrl,
        validityMinutes,
        createdAt,
        expiresAt,
        isExpired: false,
        clickCount: 0,
        clicks: []
      };

      StorageService.saveUrl(newUrl);
      newUrls.push(newUrl);
      updatedInputs[i].errors = [];
      logger.info('component', `Shortened URL created for input ${i + 1}`);
    }

    setUrlInputs(updatedInputs);
    setGeneratedUrls(prev => [...prev, ...newUrls]);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>

      {urlInputs.map((input, idx) => (
        <Card key={idx} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              URL #{idx + 1}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Original URL"
                  value={input.originalUrl}
                  onChange={(e) => handleChange(idx, 'originalUrl', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Custom Shortcode (optional)"
                  value={input.customShortCode}
                  onChange={(e) => handleChange(idx, 'customShortCode', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Validity (minutes, optional)"
                  value={input.validityMinutes}
                  onChange={(e) => handleChange(idx, 'validityMinutes', e.target.value)}
                />
              </Grid>
              {input.errors.length > 0 && (
                <Grid item xs={12}>
                  {input.errors.map((error, i) => (
                    <Alert key={i} severity="error" sx={{ mb: 1 }}>
                      {error}
                    </Alert>
                  ))}
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Shorten URLs
      </Button>

      {generatedUrls.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h5" gutterBottom>
            Shortened URLs
          </Typography>
          {generatedUrls.map((url) => (
            <Card key={url.shortCode} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body1"><strong>Original URL:</strong> {url.originalUrl}</Typography>
                <Typography variant="body1"><strong>Short URL:</strong> <a href={url.shortUrl}>{url.shortUrl}</a></Typography>
                <Typography variant="body1"><strong>Expires At:</strong> {UrlUtils.formatDateTime(url.expiresAt)}</Typography>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

export default UrlShortenerPage;
