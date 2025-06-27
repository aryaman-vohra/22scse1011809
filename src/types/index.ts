// src/types/index.ts

export interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  validityMinutes: number;
  createdAt: Date;
  expiresAt: Date;
  isExpired: boolean;
  clickCount: number;
  clicks: ClickData[];
}

export interface ClickData {
  id: string;
  timestamp: Date;
  source: string;
  userAgent: string;
  ipAddress: string;
  country?: string;
  city?: string;
  referrer?: string;
}

export interface CreateUrlRequest {
  originalUrl: string;
  validityMinutes?: number;
  customShortCode?: string;
}

export interface CreateUrlResponse {
  success: boolean;
  data?: UrlData;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AppState {
  urls: UrlData[];
  loading: boolean;
  error: string | null;
}

export interface GeolocationData {
  country: string;
  city: string;
  latitude?: number;
  longitude?: number;
}