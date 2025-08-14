import express from 'express';
import basicAuth from 'express-basic-auth';
import {Player} from '../models/player.js';
import {config} from "../config.js";

const router = express.Router();

// Auth Middleware
const USER = config.adminAuth.user;
const PASS = config.adminAuth.password;

const authMiddleware = basicAuth({
    users: {[USER]: PASS},
    challenge: true
});

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Get all players (filtered)
 *     description: Retrieves a list of players, optionally filtered by active status or platform.
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [PC, PSN, Xbox, unknown, other]
 *         description: Filter by platform
 *     responses:
 *       '200':
 *         description: List of players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Player's unique ID
 *                   message_id:
 *                     type: number
 *                   message_date:
 *                     type: string
 *                     format: date-time
 *                   sender:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       name:
 *                         type: string
 *                       gender:
 *                         type: string
 *                         enum: [unknown, male, female, other]
 *                   group:
 *                     type: object
 *                     properties:
 *                       group_id:
 *                         type: string
 *                       group_title:
 *                         type: string
 *                       group_username:
 *                         type: string
 *                   message:
 *                     type: string
 *                   platform:
 *                     type: string
 *                     enum: [PC, PSN, Xbox, unknown, other]
 *                   rank:
 *                     type: string
 *                   active:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       '500':
 *         description: Failed to fetch players
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/', authMiddleware, async (req, res) => {
    const {active, platform} = req.query;
    const q = {};
    if (active !== undefined) q.active = active === 'true';
    if (platform) q.platform = platform;

    try {
        const data = await Player.find(q).sort({message_date: -1}).limit(500);
        res.json(data);
    } catch {
        res.status(500).json({error: 'Failed to fetch players'});
    }
});

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Get player by ID
 *     description: Retrieves a single player by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Player's unique ID
 *     responses:
 *       '200':
 *         description: Player object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Player's unique ID
 *                 message_id:
 *                   type: number
 *                 message_date:
 *                   type: string
 *                   format: date-time
 *                 sender:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *                     gender:
 *                       type: string
 *                       enum: [unknown, male, female, other]
 *                 group:
 *                   type: object
 *                   properties:
 *                     group_id:
 *                       type: string
 *                     group_title:
 *                       type: string
 *                     group_username:
 *                       type: string
 *                 message:
 *                   type: string
 *                 platform:
 *                   type: string
 *                   enum: [PC, PSN, Xbox, unknown, other]
 *                 rank:
 *                   type: string
 *                 active:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       '404':
 *         description: Player not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Invalid ID or fetch error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).json({error: 'Not found'});
        res.json(player);
    } catch {
        res.status(500).json({error: 'Invalid ID or fetch error'});
    }
});

/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Add a new player
 *     description: Creates a new player with details like message, sender, and group info.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message_id:
 *                 type: number
 *                 description: Unique message identifier
 *               message_date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the message
 *               sender:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   name:
 *                     type: string
 *                   gender:
 *                     type: string
 *                     enum: [unknown, male, female, other]
 *               group:
 *                 type: object
 *                 properties:
 *                   group_id:
 *                     type: string
 *                   group_title:
 *                     type: string
 *                   group_username:
 *                     type: string
 *               message:
 *                 type: string
 *                 description: Player's message content
 *               platform:
 *                 type: string
 *                 enum: [PC, PSN, Xbox, unknown, other]
 *                 description: Gaming platform
 *               rank:
 *                 type: string
 *                 description: Player's rank
 *               active:
 *                 type: boolean
 *                 description: Player's active status
 *             required:
 *               - message_id
 *               - message_date
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [PC, PSN, Xbox, unknown, other]
 *         description: Filter by platform
 *     responses:
 *       '201':
 *         description: Player created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Player's unique ID
 *                 message_id:
 *                   type: number
 *                 message_date:
 *                   type: string
 *                   format: date-time
 *                 sender:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *                     gender:
 *                       type: string
 *                       enum: [unknown, male, female, other]
 *                 group:
 *                   type: object
 *                   properties:
 *                     group_id:
 *                       type: string
 *                     group_title:
 *                       type: string
 *                     group_username:
 *                       type: string
 *                 message:
 *                   type: string
 *                 platform:
 *                   type: string
 *                   enum: [PC, PSN, Xbox, unknown, other]
 *                 rank:
 *                   type: string
 *                 active:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       '400':
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       '409':
 *         description: Duplicate message for this group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 key:
 *                   type: object
 *                   properties:
 *                     message_id:
 *                       type: number
 *                   description: Key causing the duplicate error
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const player = new Player(req.body);
        await player.save();
        res.status(201).json(player);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({error: 'Duplicate message for this group', key: err.keyValue});
        }
        res.status(400).json({error: err.message});
    }
});

/**
 * @swagger
 * /api/players/{id}:
 *   patch:
 *     summary: Update player fields
 *     description: Updates specific fields of a player by ID (e.g., rank, active, sender.gender).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Player's unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rank:
 *                 type: string
 *                 description: Player's rank
 *               active:
 *                 type: boolean
 *                 description: Player's active status
 *               sender:
 *                 type: object
 *                 properties:
 *                   gender:
 *                     type: string
 *                     enum: [unknown, male, female, other]
 *                     description: Sender's gender
 *     responses:
 *       '200':
 *         description: Updated player
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Player's unique ID
 *                 message_id:
 *                   type: number
 *                 message_date:
 *                   type: string
 *                   format: date-time
 *                 sender:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *                     gender:
 *                       type: string
 *                       enum: [unknown, male, female, other]
 *                 group:
 *                   type: object
 *                   properties:
 *                     group_id:
 *                       type: string
 *                     group_title:
 *                       type: string
 *                     group_username:
 *                       type: string
 *                 message:
 *                   type: string
 *                 platform:
 *                   type: string
 *                   enum: [PC, PSN, Xbox, unknown, other]
 *                 rank:
 *                   type: string
 *                 active:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       '400':
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       '404':
 *         description: Player not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.patch('/:id', authMiddleware, async (req, res) => {
    const allowedFields = ['rank', 'active', 'sender.gender'];
    const update = {};
    for (const key of allowedFields) {
        if (req.body.hasOwnProperty(key)) {
            update[key] = req.body[key];
        }
    }

    try {
        const player = await Player.findByIdAndUpdate(req.params.id, update, {new: true});
        if (!player) return res.status(404).json({error: 'Not found'});
        res.json(player);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

export default router;