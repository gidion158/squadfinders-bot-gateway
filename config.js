import 'dotenv/config';

export const config = {
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://admin:password@host:27017/players?authSource=admin',
  },
  adminAuth: {
    user: process.env.ADMIN_USER || 'user',
    pass: process.env.ADMIN_PASS || 'password',
  },
  cookie: {
    name: 'playerfinder',
    secret: process.env.COOKIE_SECRET || 'a-very-secret-and-strong-password-for-cookies',
  },
  server: {
    proxypass: process.env.PROXY_PASS || false,
    url: process.env.SERVER_URL || 'http://localhost',
    port: process.env.PORT || 3000,
  },
  swagger: {
    title: 'Bot Gateway API',
    version: '1.0.0',
    description: 'API for managing player records',
  }
};
