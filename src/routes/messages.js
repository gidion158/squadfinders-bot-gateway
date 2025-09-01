import express from 'express';
import { messageController } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 * schemas:
 * Message:
 * type: object
 * required:
 * - message_id
 * - message_date
 * properties:
 * message_id:
 * type: number
 * description: Unique message identifier
 * message_date:
 * type: string
 * format: date-time
 * sender:
 * type: object
 * properties:
 * id:
 * type: string
 * username:
 * type: string
 * name:
 * type: string
 * group:
 * type: object
 * properties:
 * group_id:
 * type: string
 * group_title:
 * type: string
 * group_username:
 * type: string
 * message:
 * type: string
 * is_valid:
 * type: boolean
 * description: Whether the message is considered valid (e.g., a proper LFG message)
 */

/**
 * @swagger
 * /api/messages:
 * get:
 * summary: Get all messages
 * tags: [Messages]
 * security:
 * - basicAuth: []
 * parameters:
 * - in: query
 * name: group_username
 * schema:
 * type: string
 * - in: query
 * name: sender_username
 * schema:
 * type: string
 * - in: query
 * name: page
 * schema:
 * type: integer
 * default: 1
 * - in: query
 * name: limit
 * schema:
 * type: integer
 * default: 100
 * responses:
 * 200:
 * description: List of messages with pagination
 */
router.get('/', authMiddleware, messageController.getAll);

/**
 * @swagger
 * /api/messages/{id}:
 * get:
 * summary: Get message by ID
 * tags: [Messages]
 * security:
 * - basicAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Message details
 * 404:
 * description: Message not found
 */
router.get('/:id', authMiddleware, messageController.getById);

/**
 * @swagger
 * /api/messages:
 * post:
 * summary: Create new message
 * tags: [Messages]
 * security:
 * - basicAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Message'
 * responses:
 * 201:
 * description: Message created successfully
 */
router.post('/', authMiddleware, messageController.create);

/**
 * @swagger
 * /api/messages/{id}:
 * put:
 * summary: Update message
 * tags: [Messages]
 * security:
 * - basicAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Message'
 * responses:
 * 200:
 * description: Message updated successfully
 */
router.put('/:id', authMiddleware, messageController.update);

/**
 * @swagger
 * /api/messages/{id}:
 * patch:
 * summary: Partially update message
 * tags: [Messages]
 * security:
 * - basicAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Message'
 * responses:
 * 200:
 * description: Message updated successfully
 */
router.patch('/:id', authMiddleware, messageController.update);

/**
 * @swagger
 * /api/messages/{id}:
 * delete:
 * summary: Delete message
 * tags: [Messages]
 * security:
 * - basicAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Message deleted successfully
 */
router.delete('/:id', authMiddleware, messageController.delete);

export default router;
