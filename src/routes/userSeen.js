import express from 'express';
import { userSeenController } from '../controllers/userSeenController.js';
import { authMiddleware, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSeen:
 *       type: object
 *       required:
 *         - user_id
 *       properties:
 *         user_id:
 *           type: string
 *           description: Unique user identifier
 *         username:
 *           type: string
 *           description: Username
 *         seen_ids:
 *           type: array
 *           items:
 *             type: number
 *           description: Array of seen message IDs
 *         active:
 *           type: boolean
 *           default: true
 *           description: Whether the record is active
 */

/**
 * @swagger
 * /api/user-seen:
 *   get:
 *     summary: Get all user seen records
 *     tags: [User Seen]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: List of user seen records with pagination
 */
router.get('/', authMiddleware, authorizeRole(['superadmin', 'admin', 'viewer']), userSeenController.getAll);

/**
 * @swagger
 * /api/user-seen/{id}:
 *   get:
 *     summary: Get user seen record by ID
 *     tags: [User Seen]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User seen record details
 *       404:
 *         description: User seen record not found
 */
router.get('/:id', authMiddleware, authorizeRole(['superadmin', 'admin', 'viewer']), userSeenController.getById);

/**
 * @swagger
 * /api/user-seen:
 *   post:
 *     summary: Create new user seen record (SuperAdmin/Admin only)
 *     tags: [User Seen]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSeen'
 *     responses:
 *       201:
 *         description: User seen record created successfully
 */
router.post('/', authMiddleware, authorizeRole(['superadmin', 'admin']), userSeenController.create);

/**
 * @swagger
 * /api/user-seen/{id}:
 *   put:
 *     summary: Update user seen record (SuperAdmin/Admin only)
 *     tags: [User Seen]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSeen'
 *     responses:
 *       200:
 *         description: User seen record updated successfully
 */
router.put('/:id', authMiddleware, authorizeRole(['superadmin', 'admin']), userSeenController.update);

/**
 * @swagger
 * /api/user-seen/{id}:
 *   patch:
 *     summary: Partially update user seen record (SuperAdmin/Admin only)
 *     tags: [User Seen]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSeen'
 *     responses:
 *       200:
 *         description: User seen record updated successfully
 */
router.patch('/:id', authMiddleware, authorizeRole(['superadmin', 'admin']), userSeenController.update);

/**
 * @swagger
 * /api/user-seen/{id}:
 *   delete:
 *     summary: Delete user seen record (SuperAdmin/Admin only)
 *     tags: [User Seen]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User seen record deleted successfully
 */
router.delete('/:id', authMiddleware, authorizeRole(['superadmin', 'admin']), userSeenController.delete);

export default router;