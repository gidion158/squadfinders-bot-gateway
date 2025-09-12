import express from 'express';
import { gamingGroupController } from '../controllers/gamingGroupController.js';
import { authMiddleware, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     GamingGroup:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Gaming group name
 *         active:
 *           type: boolean
 *           default: true
 *           description: Whether the group is active
 */

/**
 * @swagger
 * /api/gaming-groups:
 *   get:
 *     summary: Get all active gaming groups
 *     tags: [Gaming Groups]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: List of active gaming groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 */
router.get('/', authMiddleware, authorizeRole(['admin', 'viewer']), gamingGroupController.getActiveGroups);

export default router;