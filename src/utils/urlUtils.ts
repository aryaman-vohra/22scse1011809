import { ValidationResult, GeolocationData } from '../types';
import { logger } from './logging';

export class UrlUtils {
  private static readonly VALID_URL_REGEX = /^https?:\/\/([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;
  private static readonly SHORTCODE_REGEX = /^[a-zA-Z0-9]{4,10}$/;

  public static validateUrl(url: string): ValidationResult {
    const errors: string[] = [];
    if (!url || url.trim() === '') {
      errors.push('URL is required');
    } else if (!this.VALID_URL_REGEX.test(url.trim())) {
      errors.push('Please enter a valid URL (must include http:// or https://)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public static validateShortCode(shortCode: string, existingCodes: string[]): ValidationResult {
    const errors: string[] = [];

    if (shortCode) {
      if (!this.SHORTCODE_REGEX.test(shortCode)) {
        errors.push('Short code must be 4–10 characters long and contain only letters and numbers');
      } else if (existingCodes.includes(shortCode.toLowerCase())) {
        errors.push('This short code is already taken');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public static validateValidityMinutes(validity: string): ValidationResult {
    const errors: string[] = [];

    if (validity) {
      const validityNum = parseInt(validity, 10);
      if (isNaN(validityNum) || validityNum <= 0) {
        errors.push('Validity must be a positive number');
      } else if (validityNum > 525600) {
        errors.push('Validity cannot exceed 1 year (525600 minutes)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public static generateShortCode(existingCodes: string[]): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let shortCode: string;

    do {
      shortCode = '';
      for (let i = 0; i < 6; i++) {
        shortCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (existingCodes.includes(shortCode.toLowerCase()));

    logger.debug('utils', `Generated unique short code: ${shortCode}`);
    return shortCode;
  }

  // ✅ Updated function
  public static createShortUrl(shortCode: string): string {
    return `${window.location.origin.replace(/\/$/, '')}/${shortCode}`;
  }

  public static isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  public static calculateExpiryDate(validityMinutes: number): Date {
    const now = new Date();
    return new Date(now.getTime() + validityMinutes * 60 * 1000);
  }

  public static formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  public static getTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }

  public static async getGeolocation(): Promise<GeolocationData> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      return {
        country: data.country_name || 'Unknown',
        city: data.city || 'Unknown',
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      logger.warn('utils', 'Failed to get geolocation data');
      return {
        country: 'Unknown',
        city: 'Unknown'
      };
    }
  }

  public static getClickSource(): string {
    const referrer = document.referrer;
    if (!referrer) return 'Direct';

    try {
      const url = new URL(referrer);
      return url.hostname;
    } catch {
      return 'Unknown';
    }
  }

  public static getUserAgent(): string {
    return navigator.userAgent;
  }
}
