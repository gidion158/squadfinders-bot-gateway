import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authMiddleware, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics including counts for all models
 */
router.get('/stats', authMiddleware, authorizeRole(['superadmin', 'admin', 'viewer']), dashboardController.getStats);

/**
 * @swagger
 * /api/dashboard/platform-distribution:
 *   get:
 *     summary: Get platform distribution
 *     tags: [Dashboard]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Player count by platform
 */
router.get('/platform-distribution', authMiddleware, authorizeRole(['superadmin', 'admin', 'viewer']), dashboardController.getPlatformDistribution);

/**
 * @swagger
 * /api/dashboard/messages-chart:
 *   get:
 *     summary: Get messages chart data
 *     tags: [Dashboard]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Messages count by day
 */
router.get('/messages-chart', authMiddleware, authorizeRole(['superadmin', 'admin', 'viewer']), dashboardController.getMessagesChartData);

/**
 * @swagger
 * /api/dashboard/ai-status-distribution:
 *   get:
 *     summary: Get AI status distribution
 *     tags: [Dashboard]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Message count by AI status
 */
router.get('/ai-status-distribution', authMiddleware, authorizeRole(['superadmin', 'admin', 'viewer']), dashboardController.getAIStatusDistribution);

/**
 * @swagger
 * /api/dashboard/deleted-messages-chart:
 *   get:
 *     summary: Get deleted messages chart data
 *     tags: [Dashboard]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           default: "7d"
 *         description: Time range for the chart (e.g., '7d', '30d', '3mo')
 *     responses:
 *       200:
 *         description: Deleted messages count by day with average deletion time
 */
router.get('/deleted-messages-chart', authMiddleware, authorizeRole(['superadmin', 'admin', 'viewer']), dashboardController.getDeletedMessagesChartData);

export default router;