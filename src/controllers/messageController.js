import { Message, DeletedMessage } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';
import { validateObjectId, validateMessageId } from '../utils/validators.js';

export const messageController = {
  // Get all messages with filtering and pagination
  getAll: handleAsyncError(async (req, res) => {
    const { page = 1, limit = 100, group_username, sender_username, is_valid, is_lfg, ai_status } = req.query;
    const query = {};
    
    if (group_username) query['group.group_username'] = group_username;
    if (sender_username) query['sender.username'] = sender_username;
    if (is_valid !== undefined) query.is_valid = is_valid === 'true';
    if (is_lfg !== undefined) query.is_lfg = is_lfg === 'true';
    if (ai_status) query.ai_status = ai_status;

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

  // Get valid messages since a specific timestamp
  getValidSince: handleAsyncError(async (req, res) => {
    const { timestamp } = req.query;

    if (!timestamp) {
      return res.status(400).json({ error: 'Timestamp query parameter is required.' });
    }

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid timestamp format. Please use ISO 8601 format.' });
    }

    const messages = await Message.find({
      message_date: { $gte: date },
      is_valid: true
    }).sort({ message_date: -1 }); // Sort by most recent first

    res.json({
      data: messages
    });
  }),

  // Get unprocessed messages for AI processing
  getUnprocessed: handleAsyncError(async (req, res) => {
    const { limit = 50 } = req.query;
    const maxLimit = Math.min(parseInt(limit), 100);
    
    // Messages older than 5 minutes should be expired
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // First, expire old pending messages
    await Message.updateMany(
      {
        ai_status: 'pending',
        createdAt: { $lt: fiveMinutesAgo }
      },
      {
        $set: { ai_status: 'expired' }
      }
    );

    // Get recent pending messages and mark them as processing
    const recentPendingMessages = await Message.find({
      is_valid: true,
      ai_status: 'pending',
      createdAt: { $gte: fiveMinutesAgo }
    })
    .sort({ createdAt: 1 }) // Oldest first
    .limit(maxLimit);

    // Mark these messages as processing
    if (recentPendingMessages.length > 0) {
      const messageIds = recentPendingMessages.map(msg => msg._id);
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { ai_status: 'processing' } }
      );

      // Update the status in the returned data
      recentPendingMessages.forEach(msg => {
        msg.ai_status = 'processing';
      });
    }

    res.json({
      data: recentPendingMessages,
      count: recentPendingMessages.length
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

    // Calculate deletion time in minutes
    const deletionTimeMinutes = Math.round((Date.now() - message.message_date.getTime()) / (1000 * 60));

    // Store deleted message for analytics
    await DeletedMessage.create({
      original_message_id: message.message_id,
      message_date: message.message_date,
      deleted_at: new Date(),
      sender: message.sender,
      group: message.group,
      message: message.message,
      is_valid: message.is_valid,
      is_lfg: message.is_lfg,
      reason: message.reason,
      ai_status: message.ai_status,
      deletion_time_minutes: deletionTimeMinutes
    });

    // Delete the original message
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
    let message, deletionTimeMinutes;

    if (validateObjectId(id)) {
      message = await Message.findById(id);
    } else if (validateMessageId(id)) {
      message = await Message.findOne({ message_id: parseInt(id, 10) });
    }

    // Calculate deletion time in minutes
    deletionTimeMinutes = Math.round((Date.now() - message.message_date.getTime()) / (1000 * 60));

    // Store deleted message for analytics
    await DeletedMessage.create({
      original_message_id: message.message_id,
      message_date: message.message_date,
      deleted_at: new Date(),
      sender: message.sender,
      group: message.group,
      message: message.message,
      is_valid: message.is_valid,
      is_lfg: message.is_lfg,
      reason: message.reason,
      ai_status: message.ai_status,
      deletion_time_minutes: deletionTimeMinutes
    });

    // Delete the original message
    if (validateObjectId(id)) {
      await Message.findByIdAndDelete(id);
    } else if (validateMessageId(id)) {
      await Message.findOneAndDelete({ message_id: parseInt(id, 10) });
    }

    res.json({ 
      message: 'Message deleted successfully',
      deletion_analytics: {
        deletion_time_minutes: deletionTimeMinutes,
        deleted_at: new Date()
      }
      deletion_analytics: {
        deletion_time_minutes: deletionTimeMinutes,
        deleted_at: new Date()
      }
    });
  })
};