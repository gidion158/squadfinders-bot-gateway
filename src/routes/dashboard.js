import express from 'express';
import {dashboardController} from '../controllers/dashboardController.js';
import {authMiddleware} from '../middleware/auth.js';

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
router.get('/stats', authMiddleware, dashboardController.getStats);

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
router.get('/platform-distribution', authMiddleware, dashboardController.getPlatformDistribution);

router.get('/messages-chart', authMiddleware, dashboardController.getMessagesChartData);


export default router;