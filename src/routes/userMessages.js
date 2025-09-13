import express from 'express';
import { userMessageController } from '../controllers/userMessageController.js';
import { authMiddleware, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserMessage:
 *       type: object
 *       required:
 *         - user_id
 *         - message_date
 *         - message
 *       properties:
 *         user_id:
 *           type: string
 *           description: User identifier
 *         username:
 *           type: string
 *           description: Username
 *         message_date:
 *           type: string
 *           format: date-time
 *           description: When the message was sent
 *         message:
 *           type: string
 *           description: The message content
 */

/**
 * @swagger
 * /api/user-messages:
 *   get:
 *     summary: Get all user messages
 *     tags: [User Messages]
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
 *         description: List of user messages with pagination
 */
router.get('/', authMiddleware, authorizeRole(['admin', 'viewer']), userMessageController.getAll);

/**
 * @swagger
 * /api/user-messages/{id}:
 *   get:
 *     summary: Get user message by ID
 *     tags: [User Messages]
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
 *         description: User message details
 *       404:
 *         description: User message not found
 */
router.get('/:id', authMiddleware, authorizeRole(['admin', 'viewer']), userMessageController.getById);

/**
 * @swagger
 * /api/user-messages:
 *   post:
 *     summary: Create new user message (Admin only)
 *     tags: [User Messages]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserMessage'
 *     responses:
 *       201:
 *         description: User message created successfully
 */
router.post('/', authMiddleware, authorizeRole(['admin']), userMessageController.create);

/**
 * @swagger
 * /api/user-messages/{id}:
 *   put:
 *     summary: Update user message (Admin only)
 *     tags: [User Messages]
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
 *             $ref: '#/components/schemas/UserMessage'
 *     responses:
 *       200:
 *         description: User message updated successfully
 */
router.put('/:id', authMiddleware, authorizeRole(['admin']), userMessageController.update);

/**
 * @swagger
 * /api/user-messages/{id}:
 *   patch:
 *     summary: Partially update user message (Admin only)
 *     tags: [User Messages]
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
 *             $ref: '#/components/schemas/UserMessage'
 *     responses:
 *       200:
 *         description: User message updated successfully
 */
router.patch('/:id', authMiddleware, authorizeRole(['admin']), userMessageController.update);

export default router;