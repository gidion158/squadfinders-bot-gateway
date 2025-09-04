import express from 'express';
import { deletedMessageController } from '../controllers/deletedMessageController.js';
import { authMiddleware, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 * schemas:
 * DeletedMessage:
 * type: object
 * properties:
 * original_message_id:
 * type: number
 * description: Original message ID that was deleted
 * message_date:
 * type: string
 * format: date-time
 * description: Original message creation date
 * deleted_at:
 * type: string
 * format: date-time
 * description: When the message was deleted
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
 * is_lfg:
 * type: boolean
 * reason:
 * type: string
 * ai_status:
 * type: string
 * enum: [pending, processing, completed, failed, expired]
 * deletion_time_minutes:
 * type: number
 * description: Time between message creation and deletion in minutes
 */

/**
 * @swagger
 * /api/deleted-messages:
 * get:
 * summary: Get all deleted messages
 * tags: [Deleted Messages]
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
 * name: is_valid
 * schema:
 * type: boolean
 * - in: query
 * name: is_lfg
 * schema:
 * type: boolean
 * - in: query
 * name: ai_status
 * schema:
 * type: string
 * enum: [pending, processing, completed, failed, expired]
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
 * description: List of deleted messages with pagination
 */
router.get('/', authMiddleware, authorizeRole(['admin', 'viewer']), deletedMessageController.getAll);

/**
 * @swagger
 * /api/deleted-messages/stats:
 * get:
 * summary: Get deletion statistics
 * tags: [Deleted Messages]
 * security:
 * - basicAuth: []
 * responses:
 * 200:
 * description: Deletion statistics including counts and averages
 */
router.get('/stats', authMiddleware, authorizeRole(['admin', 'viewer']), deletedMessageController.getStats);

/**
 * @swagger
 * /api/deleted-messages/daily:
 * get:
 * summary: Get daily deletion counts
 * tags: [Deleted Messages]
 * security:
 * - basicAuth: []
 * parameters:
 * - in: query
 * name: days
 * schema:
 * type: integer
 * default: 30
 * description: Number of days to look back
 * responses:
 * 200:
 * description: Daily deletion counts
 */
router.get('/daily', authMiddleware, authorizeRole(['admin', 'viewer']), deletedMessageController.getDailyStats);

/**
 * @swagger
 * /api/deleted-messages/{id}:
 * get:
 * summary: Get deleted message by ID
 * tags: [Deleted Messages]
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
 * description: Deleted message details
 * 404:
 * description: Deleted message not found
 */
router.get('/:id', authMiddleware, authorizeRole(['admin', 'viewer']), deletedMessageController.getById);

export default router;
