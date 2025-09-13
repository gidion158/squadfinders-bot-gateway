import { UserMessage } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';
import { validateObjectId } from '../utils/validators.js';

export const userMessageController = {
  // Get all user messages with pagination
  getAll: handleAsyncError(async (req, res) => {
    const { page = 1, limit = 100, user_id, username } = req.query;
    const query = {};
    
    if (user_id) query.user_id = user_id;
    if (username) query.username = username;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [messages, total] = await Promise.all([
      UserMessage.find(query)
        .sort({ message_date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      UserMessage.countDocuments(query)
    ]);

    res.json({
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  }),

  // Get user message by ID
  getById: handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const message = await UserMessage.findById(id);

    if (!message) {
      return res.status(404).json({ error: 'User message not found' });
    }

    res.json(message);
  }),

  // Create new user message
  create: handleAsyncError(async (req, res) => {
    const message = new UserMessage(req.body);
    await message.save();
    res.status(201).json(message);
  }),

  // Update user message
  update: handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const message = await UserMessage.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!message) {
      return res.status(404).json({ error: 'User message not found' });
    }

    res.json(message);
  })
};