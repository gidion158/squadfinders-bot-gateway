import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

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
 * /api/dashboard/messages-over-time:
 * get:
 * summary: Get messages over time for charts
 * tags: [Dashboard]
 * security:
 * - basicAuth: []
 * parameters:
 * - in: query
 * name: days
 * schema:
 * type: integer
 * default: 30
 * responses:
 * 200:
 * description: Messages count grouped by date
 */
router.get('/messages-over-time', authMiddleware, dashboardController.getMessagesOverTime);

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
 * /api/dashboard/messages-per-minute-over-time:
 * get:
 * summary: Get messages per minute over time for charts
 * tags: [Dashboard]
 * security:
 * - basicAuth: []
 * parameters:
 * - in: query
 * name: minutes
 * schema:
 * type: integer
 * default: 60
 * responses:
 * 200:
 * description: Messages count per minute grouped by date
 */
router.get('/messages-per-minute-over-time', authMiddleware, dashboardController.getMessagesPerMinuteOverTime);

export default router;