import winston from 'winston';
import { config } from '../config/index.js';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let logMessage = `[${timestamp}] ${level.toUpperCase()}`;
    if (service) logMessage += ` [${service}]`;
    logMessage += `: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += ` | ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'squadfinders-api' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    
    // File transport for production
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
});

// Create service-specific loggers
export const createServiceLogger = (serviceName) => {
  return logger.child({ service: serviceName });
};

// Export main logger
export default logger;

// Helper functions for common logging patterns
export const logApiRequest = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    logger.info('API Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    originalSend.call(this, data);
  };
  
  next();
};

export const logError = (error, context = {}) => {
  logger.error('Application Error', {
    error: error.message,
    stack: error.stack,
    ...context
  });
};

export const logMessageProcessing = (action, messageData, additionalInfo = {}) => {
  logger.info(`Message Processing: ${action}`, {
    messageId: messageData.message_id,
    messageDate: messageData.message_date,
    aiStatus: messageData.ai_status,
    ...additionalInfo
  });
};

export const logAutoExpiry = (action, data = {}) => {
  const autoExpiryLogger = createServiceLogger('auto-expiry');
  autoExpiryLogger.info(action, data);
};

export const logCleanup = (action, data = {}) => {
  const cleanupLogger = createServiceLogger('cleanup');
  cleanupLogger.info(action, data);
};