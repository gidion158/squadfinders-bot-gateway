import express from 'express';
import { aiResponseController } from '../controllers/aiResponseController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AIResponse:
 *       type: object
 *       required:
 *         - message_id
 *       properties:
 *         message_id:
 *           type: number
 *           description: Unique message identifier
 *         message:
 *           type: string
 *           description: The message content
 *         is_lfg:
 *           type: boolean
 *           description: Whether this is a looking for group message
 *         reason:
 *           type: string
 *           description: Reason for the AI classification
 */

/**
 * @swagger
 * /api/ai-responses:
 *   get:
 *     summary: Get all AI responses
 *     tags: [AI Responses]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: is_lfg
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
 *         description: List of AI responses with pagination
 */
router.get('/', authMiddleware, aiResponseController.getAll);

/**
 * @swagger
 * /api/ai-responses/{id}:
 *   get:
 *     summary: Get AI response by ID
 *     tags: [AI Responses]
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
 *         description: AI response details
 *       404:
 *         description: AI response not found
 */
router.get('/:id', authMiddleware, aiResponseController.getById);

/**
 * @swagger
 * /api/ai-responses:
 *   post:
 *     summary: Create new AI response
 *     tags: [AI Responses]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIResponse'
 *     responses:
 *       201:
 *         description: AI response created successfully
 */
router.post('/', authMiddleware, aiResponseController.create);

/**
 * @swagger
 * /api/ai-responses/{id}:
 *   put:
 *     summary: Update AI response
 *     tags: [AI Responses]
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
 *             $ref: '#/components/schemas/AIResponse'
 *     responses:
 *       200:
 *         description: AI response updated successfully
 */
router.put('/:id', authMiddleware, aiResponseController.update);

/**
 * @swagger
 * /api/ai-responses/{id}:
 *   patch:
 *     summary: Partially update AI response
 *     tags: [AI Responses]
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
 *             $ref: '#/components/schemas/AIResponse'
 *     responses:
 *       200:
 *         description: AI response updated successfully
 */
router.patch('/:id', authMiddleware, aiResponseController.update);

/**
 * @swagger
 * /api/ai-responses/{id}:
 *   delete:
 *     summary: Delete AI response
 *     tags: [AI Responses]
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
 *         description: AI response deleted successfully
 */
router.delete('/:id', authMiddleware, aiResponseController.delete);

export default router;