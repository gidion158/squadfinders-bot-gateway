import express from 'express';
import AdminJSExpress from '@adminjs/express';
import swaggerUi from 'swagger-ui-express';
import bcrypt from 'bcrypt';

import { connectDatabase } from './config/database.js';
import { config } from './config/index.js';
import { swaggerSpec } from './config/swagger.js';
import { adminJS } from './config/adminjs.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import apiRoutes from './routes/index.js';
import { AdminUser } from './models/index.js';

// Initialize Express app
const app = express();

// Connect to database
await connectDatabase();

// AdminJS Authentication
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJS, {
  authenticate: async (email, password) => {
    try {
      const user = await AdminUser.findOne({ email: email.toLowerCase() });
      if (user && await user.comparePassword(password)) {
        return user;
      }
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  },
  cookieName: config.cookie.name,
  cookiePassword: config.cookie.secret,
}, {
  resave: false,
  saveUninitialized: false,
  secret: config.cookie.secret,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

// Mount AdminJS
app.use(adminJS.options.rootPath, adminRouter);

// Middleware (MUST come after AdminJS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Swagger Documentation
app.use('/docs', authMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SquadFinders API Documentation'
}));

// Root route
app.get('/', authMiddleware, (req, res) => {
  res.json({
    message: 'SquadFinders Bot Gateway API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      admin: `${req.protocol}://${req.get('host')}/admin`,
      api: `${req.protocol}://${req.get('host')}/api`,
      docs: `${req.protocol}://${req.get('host')}/docs`
    },
    note: 'API endpoints require basic authentication'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.server.port;
const URL = config.server.url;
const isProxyPass = config.server.proxypass;

app.listen(PORT, () => {
  const baseUrl = isProxyPass ? URL : `${URL}:${PORT}`;
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Admin Panel: ${baseUrl}/admin`);
  console.log(`🔗 API Docs: ${baseUrl}/docs`);
  console.log(`⚡ API Base: ${baseUrl}/api`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});