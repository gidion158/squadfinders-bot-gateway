import 'dotenv/config';

export const config = {
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://admin:password@host:27017/players?authSource=admin',
  },
  adminAuth: {
    user: process.env.ADMIN_USER || 'squadfinders',
    pass: process.env.ADMIN_PASS || 'some-secure-password',
  },
  cookie: {
    name: 'squadfinders-session',
    secret: process.env.COOKIE_SECRET || 'change-this-cookie-secret',
  },
  server: {
    proxypass: process.env.PROXY_PASS === 'true',
    url: process.env.SERVER_URL || 'http://localhost',
    port: parseInt(process.env.PORT) || 3000,
  },
  swagger: {
    title: 'SquadFinders Bot Gateway API',
    version: '1.0.0',
    description: 'API for managing player records and messages',
  },
  autoExpiry: {
    enabled: process.env.AUTO_EXPIRY_ENABLED !== 'false', // Default true
    expiryMinutes: parseInt(process.env.EXPIRY_MINUTES) || 5, // Default 5 minutes
    intervalMinutes: parseInt(process.env.EXPIRY_INTERVAL_MINUTES) || 1, // Default 1 minute
  },
  userSeenCleanup: {
    enabled: process.env.USER_SEEN_CLEANUP_ENABLED !== 'false', // Default true
    disableAfterHours: parseInt(process.env.USER_SEEN_DISABLE_AFTER_HOURS) || 2, // Default 2 hours
    intervalHours: parseInt(process.env.USER_SEEN_CLEANUP_INTERVAL_HOURS) || 12, // Default 12 hours
  },
  playerCleanup: {
    enabled: process.env.PLAYER_CLEANUP_ENABLED !== 'false', // Default true
    disableAfterHours: parseInt(process.env.PLAYER_DISABLE_AFTER_HOURS) || 6, // Default 6 hours
    intervalHours: parseInt(process.env.PLAYER_CLEANUP_INTERVAL_HOURS) || 12, // Default 12 hours
  }
};