import mongoose from 'mongoose';
import { Player, Message, AdminUser, DailyDeletion, DeletedMessage, DeletedMessageStats } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';

const DeletedMessageStatsSchema = new mongoose.Schema({
  // Simple counter schema - just track counts
  totalDeleted: {
    type: Number,
    default: 0
  },
  deletedToday: {
    type: Number,
    default: 0
  },
  lastResetDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Daily deletion tracking for charts
const DailyDeletionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Minimal DeletedMessage schema (restores dashboard chart usage)
const DeletedMessageSchema = new mongoose.Schema({
  // When the message was deleted
  deleted_at: {
    type: Date,
    default: Date.now,
    required: true
  },
  // Deletion time in minutes (how long message lived before deletion)
  deletion_time_minutes: {
    type: Number,
    default: 0
  },
  // Optional: store reference to original message id (if available)
  message_id: {
    type: Number,
    default: null
  },
  // Optional metadata
  group: {
    group_id: { type: String, default: null },
    group_title: { type: String, default: null },
    group_username: { type: String, default: null }
  },
  sender: {
    id: { type: String, default: null },
    username: { type: String, default: null },
    name: { type: String, default: null }
  }
}, {
  timestamps: true
});

// Index for better query performance
// DailyDeletionSchema.index({ date: 1 });

export const DeletedMessageStats = mongoose.model('DeletedMessageStats', DeletedMessageStatsSchema);
export const DailyDeletion = mongoose.model('DailyDeletion', DailyDeletionSchema);
export const DeletedMessage = mongoose.model('DeletedMessage', DeletedMessageSchema);

export const dashboardController = {
  // Get dashboard statistics
  getStats: handleAsyncError(async (req, res) => {
    const { timeRange = '24h' } = req.query;
    const startDate = parseTimeframe(timeRange);

    const [playerCount, messageCount, adminUserCount] = await Promise.all([
      Player.countDocuments(),
      Message.countDocuments(),
      AdminUser.countDocuments()
    ]);

    // Get deletion stats
    const deletionStats = await DeletedMessageStats.findOne();

    const [activePlayers, pcPlayers, consolePlayers, lfgMessages, validMessages] = await Promise.all([
      Player.countDocuments({ active: true }),
      Player.countDocuments({ platform: 'PC' }),
      Player.countDocuments({ platform: 'Console' }),
      Message.countDocuments({ is_lfg: true }),
      Message.countDocuments({ is_valid: true })
    ]);

    // AI Status counts (all time)
    const [pendingMessages, completedMessages, failedMessages, expiredMessages, pendingPrefilterMessages] = await Promise.all([
      Message.countDocuments({ ai_status: 'pending', is_valid: true }),
      Message.countDocuments({ ai_status: 'completed' }),
      Message.countDocuments({ ai_status: 'failed' }),
      Message.countDocuments({ ai_status: 'expired' }),
      Message.countDocuments({ ai_status: 'pending_prefilter' })
    ]);

    // Calculate messages per minute for the selected time range
    const timeRangeMs = Date.now() - startDate.getTime();
    const timeRangeMinutes = timeRangeMs / (1000 * 60);

    const [messagesInRange, validMessagesInRange] = await Promise.all([
      Message.countDocuments({ message_date: { $gte: startDate } }),
      Message.countDocuments({ message_date: { $gte: startDate }, is_valid: true })
    ]);

    // Calculate messages today (from 00:00 today until now) - for "deleted today"
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Messages for the selected time range (not just today)
    const [messagesForTimeRange, validMessagesForTimeRange] = await Promise.all([
      Message.countDocuments({ message_date: { $gte: startDate } }),
      Message.countDocuments({ message_date: { $gte: startDate }, is_valid: true })
    ]);

    res.json({
      counts: {
        players: playerCount,
        messages: messageCount,
        adminUsers: adminUserCount,
        deletedMessages: deletionStats?.totalDeleted || 0,
        activePlayers,
        pcPlayers,
        consolePlayers,
        lfgMessages,
        validMessages,
        pendingMessages,
        completedMessages,
        failedMessages,
        expiredMessages,
        pendingPrefilterMessages,
        messagesPerMinute: timeRangeMinutes > 0 ? Math.round(messagesInRange / timeRangeMinutes * 100) / 100 : 0,
        validMessagesPerMinute: timeRangeMinutes > 0 ? Math.round(validMessagesInRange / timeRangeMinutes * 100) / 100 : 0,
        messagesToday: messagesForTimeRange,
        validMessagesToday: validMessagesForTimeRange,
        deletedToday: deletionStats?.deletedToday || 0
      }
    });
  }),

  // Get deleted messages chart data
  getDeletedMessagesChartData: handleAsyncError(async (req, res) => {
    const { timeframe = '7d' } = req.query;
    const startDate = parseTimeframe(timeframe);

    const deletedMessages = await DeletedMessage.aggregate([
      {
        $match: { deleted_at: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$deleted_at' },
            month: { $month: '$deleted_at' },
            day: { $dayOfMonth: '$deleted_at' }
          },
          count: { $sum: 1 },
          avgDeletionTime: { $avg: '$deletion_time_minutes' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    const formattedData = deletedMessages.map(item => ({
      date: new Date(item._id.year, item._id.month - 1, item._id.day).toISOString(),
      count: item.count,
      avgDeletionTimeMinutes: Math.round(item.avgDeletionTime * 100) / 100
    }));

    res.json(formattedData);
  }),

  // ...existing code...
};