/**
 * Browser-safe logger utility for frontend
 * Provides consistent logging with environment awareness
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
    [key: string]: unknown;
}

class Logger {
    private isDevelopment = import.meta.env.DEV;

    /**
     * Debug logs - only shown in development
     */
    debug(message: string, meta?: LogMeta): void {
        if (this.isDevelopment) {
            console.log(`[DEBUG] ${message}`, meta || '');
        }
    }

    /**
     * Info logs - shown in all environments
     */
    info(message: string, meta?: LogMeta): void {
        console.log(`[INFO] ${message}`, meta || '');
    }

    /**
     * Warning logs - shown in all environments
     */
    warn(message: string, meta?: LogMeta): void {
        console.warn(`[WARN] ${message}`, meta || '');
    }

    /**
     * Error logs - shown in all environments
     * Accepts Error object or unknown error
     */
    error(message: string, error?: Error | unknown, meta?: LogMeta): void {
        if (error instanceof Error) {
            console.error(`[ERROR] ${message}`, {
                error: error.message,
                stack: error.stack,
                ...meta
            });
        } else if (error) {
            console.error(`[ERROR] ${message}`, { error, ...meta });
        } else {
            console.error(`[ERROR] ${message}`, meta || '');
        }
    }
}

export const logger = new Logger();
