import { Player, Message, AdminUser, DeletedMessage } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';

// Helper function to parse timeframe string (e.g., '60m', '12h', '7d')
const parseTimeframe = (timeframe) => {
  const unit = timeframe.slice(-1);
  const value = parseInt(timeframe.slice(0, -1));
  let milliseconds;

  switch (unit) {
    case 'm':
      milliseconds = value * 60 * 1000;
      break;
    case 'h':
      milliseconds = value * 60 * 60 * 1000;
      break;
    case 'd':
      milliseconds = value * 24 * 60 * 60 * 1000;
      break;
    case 'y':
      milliseconds = value * 365 * 24 * 60 * 60 * 1000;
      break;
    default: // Assume months if not specified (e.g., '1mo', '3mo')
      milliseconds = value * 30 * 24 * 60 * 60 * 1000;
      break;
  }

  return new Date(Date.now() - milliseconds);
};

export const dashboardController = {
  // Get dashboard statistics
  getStats: handleAsyncError(async (req, res) => {
    const [playerCount, messageCount, adminUserCount, deletedMessageCount] = await Promise.all([
      Player.countDocuments(),
      Message.countDocuments(),
      AdminUser.countDocuments(),
      DeletedMessage.countDocuments()
    ]);

    const [activePlayers, pcPlayers, consolePlayers, lfgMessages, validMessages] = await Promise.all([
      Player.countDocuments({ active: true }),
      Player.countDocuments({ platform: 'PC' }),
      Player.countDocuments({ platform: 'Console' }),
      Message.countDocuments({ is_lfg: true }),
      Message.countDocuments({ is_valid: true })
    ]);

    // AI Status counts
    const [pendingMessages, processingMessages, completedMessages, failedMessages, expiredMessages] = await Promise.all([
      Message.countDocuments({ ai_status: 'pending', is_valid: true }),
      Message.countDocuments({ ai_status: 'processing' }),
      Message.countDocuments({ ai_status: 'completed' }),
      Message.countDocuments({ ai_status: 'failed' }),
      Message.countDocuments({ ai_status: 'expired' })
    ]);

    // Calculate messages per minute (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [messagesLastHour, validMessagesLastHour] = await Promise.all([
      Message.countDocuments({ message_date: { $gte: oneHourAgo } }),
      Message.countDocuments({ message_date: { $gte: oneHourAgo }, is_valid: true })
    ]);

    // Calculate messages today (from 00:00 today until now)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const [messagesToday, validMessagesToday] = await Promise.all([
      Message.countDocuments({ message_date: { $gte: startOfToday } }),
      Message.countDocuments({ message_date: { $gte: startOfToday }, is_valid: true })
    ]);

    // Calculate deleted messages today and average deletion time
    const [deletedToday, avgDeletionTime] = await Promise.all([
      DeletedMessage.countDocuments({ deleted_at: { $gte: startOfToday } }),
      DeletedMessage.aggregate([
        {
          $group: {
            _id: null,
            avgDeletionTime: { $avg: '$deletion_time_minutes' }
          }
        }
      ])
    ]);
    res.json({
      counts: {
        players: playerCount,
        messages: messageCount,
        adminUsers: adminUserCount,
        deletedMessages: deletedMessageCount,
        activePlayers,
        pcPlayers,
        consolePlayers,
        lfgMessages,
        validMessages,
        pendingMessages,
        processingMessages,
        completedMessages,
        failedMessages,
        expiredMessages,
        messagesPerMinute: Math.round(messagesLastHour / 60 * 100) / 100,
        validMessagesPerMinute: Math.round(validMessagesLastHour / 60 * 100) / 100,
        messagesToday,
        validMessagesToday,
        deletedToday,
        avgDeletionTimeMinutes: Math.round((avgDeletionTime[0]?.avgDeletionTime || 0) * 100) / 100
      }
    });
  }),

  // Get messages over time for charts
  getMessagesChartData: handleAsyncError(async (req, res) => {
    const { timeframe = '60m' } = req.query;
    const startDate = parseTimeframe(timeframe);

    // Determine the appropriate grouping based on the timeframe
    let groupBy = {
        year: { $year: '$message_date' },
        month: { $month: '$message_date' },
        day: { $dayOfMonth: '$message_date' },
        hour: { $hour: '$message_date' },
        minute: { $minute: '$message_date' },
    };

    const durationInDays = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    if (durationInDays > 30) { // If more than a month, group by day
      delete groupBy.hour;
      delete groupBy.minute;
    } else if (durationInDays > 2) { // If more than 2 days, group by hour
      delete groupBy.minute;
    }

    const messages = await Message.aggregate([
      {
        $match: { message_date: { $gte: startDate } }
      },
      {
        $group: {
          _id: groupBy,
          totalMessages: { $sum: 1 },
          validMessages: {
            $sum: { $cond: ['$is_valid', 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1, '_id.minute': 1 }
      }
    ]);

    const formattedData = messages.map(item => ({
      date: new Date(
        item._id.year,
        item._id.month - 1,
        item._id.day,
        item._id.hour || 0,
        item._id.minute || 0
      ).toISOString(),
      totalCount: item.totalMessages,
      validCount: item.validMessages,
    }));

    res.json(formattedData);
  }),

  // Get platform distribution
  getPlatformDistribution: handleAsyncError(async (req, res) => {
    const distribution = await Player.aggregate([
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(distribution);
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
  // Get AI status distribution
  getAIStatusDistribution: handleAsyncError(async (req, res) => {
    const distribution = await Message.aggregate([
      {
        $group: {
          _id: '$ai_status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(formattedData);
  }),
    res.json(distribution);
  }),
};