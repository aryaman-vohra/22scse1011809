// src/utils/logging.ts

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogStack = 'frontend';
export type LogPackage = 
  | 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' // Frontend specific
  | 'auth' | 'config' | 'middleware' | 'utils'; // Common

interface LogRequest {
  stack: LogStack;
  level: LogLevel;
  package: LogPackage;
  message: string;
}

interface LogResponse {
  logID: string;
  message: string;
}

class Logger {
  private static instance: Logger;
  private baseUrl = process.env.REACT_APP_TEST_SERVER_URL || 'http://20.244.56.144/evaluation-service';
  private authToken: string | null = null;
  private debugMode = process.env.REACT_APP_DEBUG_LOGGING === 'true';

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  private async makeLogRequest(logData: LogRequest): Promise<LogResponse | null> {
    try {
      if (!this.authToken) {
        if (this.debugMode) {
          console.warn('No auth token available for logging');
        }
        return null;
      }

      const response = await fetch(`${this.baseUrl}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        if (this.debugMode) {
          console.warn(`Logging failed with status: ${response.status}`);
        }
        return null;
      }

      const result = await response.json();
      
      if (this.debugMode) {
        console.log(`[${logData.level.toUpperCase()}] ${logData.package}: ${logData.message}`);
      }
      
      return result;
    } catch (error) {
      if (this.debugMode) {
        console.warn('Logging request failed:', error);
      }
      return null;
    }
  }

  public async log(
    stack: LogStack,
    level: LogLevel,
    packageName: LogPackage,
    message: string
  ): Promise<void> {
    await this.makeLogRequest({
      stack,
      level,
      package: packageName,
      message,
    });
  }

  // Convenience methods for different log levels
  public async debug(packageName: LogPackage, message: string): Promise<void> {
    await this.log('frontend', 'debug', packageName, message);
  }

  public async info(packageName: LogPackage, message: string): Promise<void> {
    await this.log('frontend', 'info', packageName, message);
  }

  public async warn(packageName: LogPackage, message: string): Promise<void> {
    await this.log('frontend', 'warn', packageName, message);
  }

  public async error(packageName: LogPackage, message: string): Promise<void> {
    await this.log('frontend', 'error', packageName, message);
  }

  public async fatal(packageName: LogPackage, message: string): Promise<void> {
    await this.log('frontend', 'fatal', packageName, message);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Helper function for easy logging
export const Log = async (
  stack: LogStack,
  level: LogLevel,
  packageName: LogPackage,
  message: string
): Promise<void> => {
  await logger.log(stack, level, packageName, message);
};