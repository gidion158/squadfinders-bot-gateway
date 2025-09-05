import express from 'express';
import { deletedMessageController } from '../controllers/deletedMessageController.js';
import { authMiddleware, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/deleted-messages/stats:
 *   get:
 *     summary: Get deletion statistics
 *     tags: [Deleted Messages]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Deletion statistics including counts and averages
 */
router.get('/stats', authMiddleware, authorizeRole(['admin', 'viewer']), deletedMessageController.getStats);

/**
 * @swagger
 * /api/deleted-messages/daily:
 *   get:
 *     summary: Get daily deletion counts
 *     tags: [Deleted Messages]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: Daily deletion counts
 */
router.get('/daily', authMiddleware, authorizeRole(['admin', 'viewer']), deletedMessageController.getDailyStats);

/**
 * @swagger
 * /api/deleted-messages/chart:
 *   get:
 *     summary: Get deletion chart data
 *     tags: [Deleted Messages]
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
 *         description: Deletion chart data with counts and average deletion time
 */
router.get('/chart', authMiddleware, authorizeRole(['admin', 'viewer']), deletedMessageController.getChartData);

export default router;