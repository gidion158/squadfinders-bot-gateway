import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ... (keep the /stats and /platform-distribution routes as they are)

/**
 * @swagger
 * /api/dashboard/stats:
 * get:
 * summary: Get dashboard statistics
 * tags: [Dashboard]
 * security:
 * - basicAuth: []
 * responses:
 * 200:
 * description: Dashboard statistics including counts for all models
 */
router.get('/stats', authMiddleware, dashboardController.getStats);

/**
 * @swagger
 * /api/dashboard/platform-distribution:
 * get:
 * summary: Get platform distribution
 * tags: [Dashboard]
 * security:
 * - basicAuth: []
 * responses:
 * 200:
 * description: Player count by platform
 */
router.get('/platform-distribution', authMiddleware, dashboardController.getPlatformDistribution);


/**
 * @swagger
 * /api/dashboard/messages-chart:
 * get:
 * summary: Get messages over time for charts
 * tags: [Dashboard]
 * security:
 * - basicAuth: []
 * parameters:
 * - in: query
 * name: timeframe
 * schema:
 * type: string
 * default: '60m'
 * description: "Examples: '30m', '6h', '7d', '1mo', '1y'"
 * responses:
 * 200:
 * description: Messages count grouped by an appropriate interval
 */
router.get('/messages-chart', authMiddleware, dashboardController.getMessagesChartData);


export default router;