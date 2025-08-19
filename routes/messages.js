import express from 'express';
import basicAuth from 'express-basic-auth';
import {Message} from '../models/player.js';
import {config} from "../config.js";
import mongoose from 'mongoose';

const router = express.Router();

// Auth Middleware
const USER = config.adminAuth.user;
const PASS = config.adminAuth.pass;

const authMiddleware = basicAuth({
    users: {[USER]: PASS},
    challenge: true
});

// ============ messages
router.get('/', authMiddleware, async (req, res) => {
    const {active, platform} = req.query;
    const q = {};
    if (active !== undefined) q.active = active === 'true';
    if (platform) q.platform = platform;

    try {
        const data = await Message.find(q).sort({message_date: -1}).limit(500);
        res.json(data);
    } catch {
        res.status(500).json({error: 'Failed to fetch Messages'});
    }
});


router.get('/:id', authMiddleware, async (req, res) => {
    const {id} = req.params;

    let message;
    try {
        if (mongoose.Types.ObjectId.isValid(id)) {
            // Try searching by MongoDB _id first
            message = await Message.findById(id);
        }

        // If not found, or not a valid ObjectId, try searching by message_id
        if (!message && !isNaN(id)) {
            message = await Message.findOne({message_id: parseInt(id, 10)});
        }

        if (!message) return res.status(404).json({error: 'Message not found'});

        res.json(message);
    } catch (err) {
        res.status(500).json({error: 'Server error', details: err.message});
    }
});


router.post('/', authMiddleware, async (req, res) => {
    try {
        const message = new Message(req.body);
        await message.save();
        res.status(201).json(message);
    } catch (err) {
        console.log(err)
        if (err.code === 11000) {
            return res.status(409).json({error: 'Duplicate message for this group', key: err.keyValue});
        }
        res.status(400).json({error: err.message});
    }
});

router.patch('/:id', authMiddleware, async (req, res) => {
    const {id} = req.params;
    let message;

    try {
        if (mongoose.Types.ObjectId.isValid(id)) {
            message = await Message.findByIdAndUpdate(id, req.body, {
                new: true, runValidators: true
            });
        }

        if (!message && !isNaN(id)) {
            message = await Message.findOneAndUpdate(
                {message_id: parseInt(id, 10)},
                req.body,
                {new: true, runValidators: true}
            );
        }

        if (!message) return res.status(404).json({error: 'Message not found'});

        res.json(message);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

export default router;