import { Message } from '../models/Message.js';
import { DeletedMessageStats, DailyDeletion } from '../models/DeletedMessage.js';
import { PrefilterResult } from '../models/PrefilterResult.js';
import { handleAsyncError } from '../utils/errorHandler.js';
import { validateObjectId, validateMessageId } from '../utils/validators.js';
import { config } from '../config/index.js';

// Helper method to update deletion statistics
const updateDeletionStats = async (deletionTimeSeconds) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Use Promise.all to update both stats in parallel for better performance
  await Promise.all([
    // Update overall stats atomically
    DeletedMessageStats.findOneAndUpdate(
      {}, // Find the single stats document
      {
        $inc: {
          totalDeleted: 1,
          deletedToday: 1,
          totalDeletionTimeSeconds: deletionTimeSeconds
        },
        $set: { lastResetDate: today }
      },
      { upsert: true, new: true }
    ).then(stats => {
      // Recalculate average after the update
      if (stats) {
        stats.avgDeletionTimeSeconds = stats.totalDeletionTimeSeconds / stats.totalDeleted;
        return stats.save();
      }
    }),

    // Update daily stats for charts atomically
    DailyDeletion.findOneAndUpdate(
      { date: today },
      {
        $inc: {
          count: 1,
          totalDeletionTimeSeconds: deletionTimeSeconds
        }
      },
      { upsert: true, new: true }
    ).then(dailyStats => {
      // Recalculate average for the day
      if (dailyStats) {
        dailyStats.avgDeletionTimeSeconds = dailyStats.totalDeletionTimeSeconds / dailyStats.count;
        return dailyStats.save();
      }
    })
  ]);
};

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

  // Get pending prefilter messages
  getPendingPrefilter: handleAsyncError(async (req, res) => {
    const { limit = 50 } = req.query;
    const maxLimit = Math.min(parseInt(limit), 100);

    // Messages older than configured minutes should be expired
    const expiryTime = new Date(Date.now() - config.autoExpiry.expiryMinutes * 60 * 1000);

    // First, expire old pending_prefilter messages by changing status to expired
    await Message.updateMany(
      {
        ai_status: 'pending_prefilter',
        message_date: { $lt: expiryTime }
      },
      {
        $set: { ai_status: 'expired' }
      }
    );

    // Get recent pending_prefilter messages and mark them as pending
    const pendingPrefilterMessages = await Message.find({
      ai_status: 'pending_prefilter',
      message_date: { $gte: expiryTime }
    })
    .sort({ message_date: 1 }) // Oldest first
    .limit(maxLimit);

    // Mark these messages as pending
    if (pendingPrefilterMessages.length > 0) {
      const messageIds = pendingPrefilterMessages.map(msg => msg._id);
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { ai_status: 'pending' } }
      );

      // Update the status in the returned data
      pendingPrefilterMessages.forEach(msg => {
        msg.ai_status = 'pending';
      });
    }

    res.json({
      data: pendingPrefilterMessages,
      count: pendingPrefilterMessages.length
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
    const { sender, message } = req.body;
    
    // Spam validation: Check if sender has posted the same message in the past hour
    if (sender && sender.id && message) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const existingMessage = await Message.findOne({
        'sender.id': sender.id,
        message: message,
        message_date: { $gte: oneHourAgo }
      });
      
      if (existingMessage) {
        return res.status(409).json({ 
          error: 'Duplicate message detected',
          message: 'This sender has already posted the same message within the past hour'
        });
      }
    }
    
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

    // Update deletion statistics by calling the local helper function
    await updateDeletionStats(deletionTimeSeconds);

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
};

