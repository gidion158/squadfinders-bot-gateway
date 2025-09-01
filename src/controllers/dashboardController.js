import { Player, Message, AdminUser, AIResponse } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';

export const dashboardController = {
  // Get dashboard statistics
  getStats: handleAsyncError(async (req, res) => {
    const [playerCount, messageCount, adminUserCount, aiResponseCount] = await Promise.all([
      Player.countDocuments(),
      Message.countDocuments(),
      AdminUser.countDocuments(),
      AIResponse.countDocuments()
    ]);

    const [activePlayers, pcPlayers, consolePlayers, lfgResponses, validMessages] = await Promise.all([
      Player.countDocuments({ active: true }),
      Player.countDocuments({ platform: 'PC' }),
      Player.countDocuments({ platform: 'Console' }),
      AIResponse.countDocuments({ is_lfg: true }),
      Message.countDocuments({ is_valid: true })
    ]);

    // Calculate messages per minute (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [messagesLastHour, validMessagesLastHour] = await Promise.all([
      Message.countDocuments({ message_date: { $gte: oneHourAgo } }),
      Message.countDocuments({ message_date: { $gte: oneHourAgo }, is_valid: true })
    ]);

    res.json({
      counts: {
        players: playerCount,
        messages: messageCount,
        adminUsers: adminUserCount,
        aiResponses: aiResponseCount,
        activePlayers,
        pcPlayers,
        consolePlayers,
        lfgResponses,
        validMessages,
        messagesPerMinute: Math.round(messagesLastHour / 60 * 100) / 100,
        validMessagesPerMinute: Math.round(validMessagesLastHour / 60 * 100) / 100
      }
    });
  }),

  // Get messages over time for charts
  getMessagesOverTime: handleAsyncError(async (req, res) => {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const messagesOverTime = await Message.aggregate([
      {
        $match: {
          message_date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$message_date' },
            month: { $month: '$message_date' },
            day: { $dayOfMonth: '$message_date' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    const formattedData = messagesOverTime.map(item => ({
      date: new Date(item._id.year, item._id.month - 1, item._id.day),
      count: item.count
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

  // Get messages per minute over time for charts
  getMessagesPerMinuteOverTime: handleAsyncError(async (req, res) => {
    const { minutes = 60 } = req.query;
    const startDate = new Date(Date.now() - parseInt(minutes) * 60 * 1000);

    const messages = await Message.aggregate([
      {
        $match: {
          message_date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$message_date' },
            month: { $month: '$message_date' },
            day: { $dayOfMonth: '$message_date' },
            hour: { $hour: '$message_date' },
            minute: { $minute: '$message_date' }
          },
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
      date: new Date(item._id.year, item._id.month - 1, item._id.day, item._id.hour, item._id.minute),
      totalCount: item.totalMessages,
      validCount: item.validMessages,
    }));

    res.json(formattedData);
  }),
};