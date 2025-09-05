import { Message } from '../models/index.js';
import { DeletedMessageStats, DailyDeletion } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';
import { validateObjectId, validateMessageId } from '../utils/validators.js';
import { config } from '../config/index.js';

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
    
    // Messages older than configured minutes should be expired
    const expiryTime = new Date(Date.now() - config.autoExpiry.expiryMinutes * 60 * 1000);
    
    // First, expire old pending messages
    await Message.updateMany(
      {
        ai_status: 'pending',
        message_date: { $lt: expiryTime }
      },
      {
        $set: { ai_status: 'expired' }
      }
    );

    // Get recent pending messages and mark them as processing
    const recentPendingMessages = await Message.find({
      is_valid: true,
      ai_status: 'pending',
      message_date: { $gte: expiryTime }
    })
    .sort({ message_date: 1 }) // Oldest first
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
      message = await Message.findById(id);
    } else if (validateMessageId(id)) {
      message = await Message.findOne({ message_id: parseInt(id, 10) });
    }

    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }

    // Calculate deletion time in seconds
    const deletionTimeSeconds = Math.round((Date.now() - message.message_date.getTime()) / 1000);

    // Update deletion statistics
    await this.updateDeletionStats(deletionTimeSeconds);

    // Delete the original message
    if (validateObjectId(id)) {
      await Message.findByIdAndDelete(id);
    } else if (validateMessageId(id)) {
      await Message.findOneAndDelete({ message_id: parseInt(id, 10) });
    }

    res.json({
      message: 'Message deleted successfully',
      deletion_analytics: {
        deletion_time_seconds: deletionTimeSeconds,
        deleted_at: new Date()
      }
    });
  }),

  // Helper method to update deletion statistics
  updateDeletionStats: async (deletionTimeSeconds) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update overall stats
    let stats = await DeletedMessageStats.findOne();
    if (!stats) {
      stats = new DeletedMessageStats();
    }

    // Reset daily counter if it's a new day
    if (stats.lastResetDate < today) {
      stats.deletedToday = 0;
      stats.lastResetDate = today;
    }

    stats.totalDeleted += 1;
    stats.deletedToday += 1;
    stats.totalDeletionTimeSeconds += deletionTimeSeconds;
    stats.avgDeletionTimeSeconds = stats.totalDeletionTimeSeconds / stats.totalDeleted;
    
    await stats.save();

    // Update daily stats for charts
    let dailyStats = await DailyDeletion.findOne({ date: today });
    if (!dailyStats) {
      dailyStats = new DailyDeletion({ date: today });
    }

    dailyStats.count += 1;
    dailyStats.totalDeletionTimeSeconds += deletionTimeSeconds;
    dailyStats.avgDeletionTimeSeconds = dailyStats.totalDeletionTimeSeconds / dailyStats.count;
    
    await dailyStats.save();
  }
};
