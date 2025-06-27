import { UrlData, ClickData } from 'types';
import { logger } from './logging';

export class StorageService {
  private static readonly URLS_KEY = 'url_shortener_urls';
  private static readonly CLICKS_KEY = 'url_shortener_clicks';

  public static saveUrls(urls: UrlData[]): void {
    try {
      const serializedUrls = urls.map(url => ({
        ...url,
        createdAt: url.createdAt.toISOString(),
        expiresAt: url.expiresAt.toISOString(),
        clicks: url.clicks.map(click => ({
          ...click,
          timestamp: click.timestamp.toISOString()
        }))
      }));

      localStorage.setItem(this.URLS_KEY, JSON.stringify(serializedUrls));
      logger.debug('state', `Saved ${urls.length} URLs to storage`);
    } catch (error) {
      logger.error('state', `Failed to save URLs to storage: ${(error as Error).message}`);
    }
  }

  public static loadUrls(): UrlData[] {
    try {
      const data = localStorage.getItem(this.URLS_KEY);
      if (!data) return [];

      const parsedUrls = JSON.parse(data);
      const urls = parsedUrls.map((url: any) => ({
        ...url,
        createdAt: new Date(url.createdAt),
        expiresAt: new Date(url.expiresAt),
        clicks: (url.clicks || []).map((click: any) => ({
          ...click,
          timestamp: new Date(click.timestamp)
        }))
      }));

      logger.debug('state', `Loaded ${urls.length} URLs from storage`);
      return urls;
    } catch (error) {
      logger.error('state', `Failed to load URLs from storage: ${(error as Error).message}`);
      return [];
    }
  }

  public static saveUrl(url: UrlData): void {
    const existingUrls = this.loadUrls();
    const updatedUrls = existingUrls.filter(u => u.id !== url.id);
    updatedUrls.push(url);
    this.saveUrls(updatedUrls);
  }

  public static getUrlByShortCode(shortCode: string): UrlData | null {
    const urls = this.loadUrls();
    return urls.find(url => url.shortCode.toLowerCase() === shortCode.toLowerCase()) || null;
  }

  public static addClick(shortCode: string, clickData: ClickData): void {
    const urls = this.loadUrls();
    const urlIndex = urls.findIndex(url => url.shortCode.toLowerCase() === shortCode.toLowerCase());

    if (urlIndex !== -1) {
      urls[urlIndex].clicks.push(clickData);
      urls[urlIndex].clickCount = urls[urlIndex].clicks.length;
      this.saveUrls(urls);
      logger.info('state', `Added click for short code: ${shortCode}`);
    }
  }

  public static getAllShortCodes(): string[] {
    const urls = this.loadUrls();
    return urls.map(url => url.shortCode.toLowerCase());
  }

  public static clearExpiredUrls(): UrlData[] {
    const urls = this.loadUrls();
    const now = new Date();

    const validUrls = urls.filter(url => url.expiresAt > now);
    const expiredCount = urls.length - validUrls.length;

    if (expiredCount > 0) {
      this.saveUrls(validUrls);
      logger.info('state', `Cleaned up ${expiredCount} expired URLs`);
    }

    return validUrls;
  }

  public static getStats() {
    const urls = this.loadUrls();
    const totalClicks = urls.reduce((sum, url) => sum + url.clickCount, 0);
    const activeUrls = urls.filter(url => !url.isExpired).length;

    return {
      totalUrls: urls.length,
      activeUrls,
      expiredUrls: urls.length - activeUrls,
      totalClicks
    };
  }
}
