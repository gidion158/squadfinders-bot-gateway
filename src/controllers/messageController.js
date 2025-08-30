import { Message } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';
import { validateObjectId, validateMessageId } from '../utils/validators.js';

export const messageController = {
  // Get all messages with filtering and pagination
  getAll: handleAsyncError(async (req, res) => {
    const { page = 1, limit = 100, group_username, sender_username } = req.query;
    const query = {};
    
    if (group_username) query['group.group_username'] = group_username;
    if (sender_username) query['sender.username'] = sender_username;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [messages, total] = await Promise.all([
      Message.find(query)
        .sort({ message_date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Message.countDocuments(query)
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

  // Get message by ID or message_id
  getById: handleAsyncError(async (req, res) => {
    const { id } = req.params;
    let message;

    if (validateObjectId(id)) {
      message = await Message.findById(id);
    } else if (validateMessageId(id)) {
      message = await Message.findOne({ message_id: parseInt(id, 10) });
    }

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  }),

  // Create new message
  create: handleAsyncError(async (req, res) => {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  }),

  // Update message
  update: handleAsyncError(async (req, res) => {
    const { id } = req.params;
    let message;

    if (validateObjectId(id)) {
      message = await Message.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
    } else if (validateMessageId(id)) {
      message = await Message.findOneAndUpdate(
        { message_id: parseInt(id, 10) },
        req.body,
        { new: true, runValidators: true }
      );
    }

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  }),

  // Delete message
  delete: handleAsyncError(async (req, res) => {
    const { id } = req.params;
    let message;

    if (validateObjectId(id)) {
      message = await Message.findByIdAndDelete(id);
    } else if (validateMessageId(id)) {
      message = await Message.findOneAndDelete({ message_id: parseInt(id, 10) });
    }

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  })
};