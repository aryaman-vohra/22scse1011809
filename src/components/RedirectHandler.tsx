// src/components/RedirectHandler.tsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../utils/storageService';
import { UrlUtils } from '../utils/urlUtils';
import { logger } from '../utils/logging';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = async () => {
      if (!shortCode) return;

      const urlData = StorageService.getUrlByShortCode(shortCode);
      if (!urlData) {
        await logger.warn('component', `No URL found for shortcode: ${shortCode}`);
        navigate('/');
        return;
      }

      if (UrlUtils.isExpired(urlData.expiresAt)) {
        await logger.info('component', `Shortcode ${shortCode} is expired`);
        navigate('/');
        return;
      }

      const geo = await UrlUtils.getGeolocation();
      const clickData = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        source: UrlUtils.getClickSource(),
        userAgent: UrlUtils.getUserAgent(),
        ipAddress: '',
        country: geo.country,
        city: geo.city,
        referrer: document.referrer || '',
      };

      StorageService.addClick(shortCode, clickData);
      await logger.info('component', `Redirecting to: ${urlData.originalUrl}`);
      window.location.href = urlData.originalUrl;
    };

    redirect();
  }, [shortCode, navigate]);

  return <p>Redirecting...</p>;
};

export default RedirectHandler;
