// Simple logger for Plagg Bot
// Provides structured logging with timestamps and categories

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}

export class Logger {
    private minLevel: LogLevel = LogLevel.INFO;

    constructor(minLevel: LogLevel = LogLevel.INFO) {
        this.minLevel = minLevel;
    }

    private formatMessage(level: string, message: string, ...args: any[]): string {
        const timestamp = new Date().toISOString();
        const argsStr = args.length > 0 ? ' ' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') : '';
        
        return `[${timestamp}] [${level}] ${message}${argsStr}`;
    }

    public debug(message: string, ...args: any[]): void {
        if (this.minLevel <= LogLevel.DEBUG) {
            console.log(this.formatMessage('DEBUG', message, ...args));
        }
    }

    public info(message: string, ...args: any[]): void {
        if (this.minLevel <= LogLevel.INFO) {
            console.log(this.formatMessage('INFO', message, ...args));
        }
    }

    public warn(message: string, ...args: any[]): void {
        if (this.minLevel <= LogLevel.WARN) {
            console.warn(this.formatMessage('WARN', message, ...args));
        }
    }

    public error(message: string, ...args: any[]): void {
        if (this.minLevel <= LogLevel.ERROR) {
            console.error(this.formatMessage('ERROR', message, ...args));
        }
    }

    public fatal(message: string, ...args: any[]): void {
        if (this.minLevel <= LogLevel.FATAL) {
            console.error(this.formatMessage('FATAL', message, ...args));
        }
    }
}

// Global logger instance
export const logger = new Logger(LogLevel.INFO);

// Helper functions for common logging patterns
export const logCommand = (userId: string, command: string, args: string[] = []) => {
    logger.info(`Command executed: ${command} by ${userId}`, { args });
};

export const logError = (error: Error, context: string = '') => {
    logger.error(`Error ${context}:`, error.message, error.stack);
};

export const logDatabaseOperation = (operation: string, success: boolean, details?: any) => {
    if (success) {
        logger.info(`Database operation successful: ${operation}`, details);
    } else {
        logger.error(`Database operation failed: ${operation}`, details);
    }
};

export const logCombat = (playerId: string, action: string, result: any) => {
    logger.debug(`Combat action by ${playerId}: ${action}`, result);
};

export const logEconomy = (playerId: string, action: string, amount: number, details?: any) => {
    logger.info(`Economy action by ${playerId}: ${action} (${amount} gold)`, details);
};

export const logPvP = (player1: string, player2: string, action: string, result?: any) => {
    logger.info(`PvP action: ${action} between ${player1} and ${player2}`, result);
};

export default logger;