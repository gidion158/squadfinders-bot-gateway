import { DeletedMessage } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';
import { validateObjectId } from '../utils/validators.js';

export const deletedMessageController = {
  // Get all deleted messages with filtering and pagination
  getAll: handleAsyncError(async (req, res) => {
    const { page = 1, limit = 100, group_username, sender_username, is_valid, is_lfg, ai_status } = req.query;
    const query = {};
    
    if (group_username) query['group.group_username'] = group_username;
    if (sender_username) query['sender.username'] = sender_username;
    if (is_valid !== undefined) query.is_valid = is_valid === 'true';
    if (is_lfg !== undefined) query.is_lfg = is_lfg === 'true';
    if (ai_status) query.ai_status = ai_status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [deletedMessages, total] = await Promise.all([
      DeletedMessage.find(query)
        .sort({ deleted_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DeletedMessage.countDocuments(query)
    ]);

    res.json({
      data: deletedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  }),

  // Get deleted message by ID
  getById: handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid deleted message ID' });
    }

    const deletedMessage = await DeletedMessage.findById(id);

    if (!deletedMessage) {
      return res.status(404).json({ error: 'Deleted message not found' });
    }

    res.json(deletedMessage);
  }),

  // Get deletion statistics
  getStats: handleAsyncError(async (req, res) => {
    const [
      totalDeleted,
      deletedToday,
      avgDeletionTime,
      deletionsByStatus
    ] = await Promise.all([
      DeletedMessage.countDocuments(),
      DeletedMessage.countDocuments({
        deleted_at: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      DeletedMessage.aggregate([
        {
          $group: {
            _id: null,
            avgDeletionTime: { $avg: '$deletion_time_minutes' }
          }
        }
      ]),
      DeletedMessage.aggregate([
        {
          $group: {
            _id: '$ai_status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      totalDeleted,
      deletedToday,
      avgDeletionTimeMinutes: avgDeletionTime[0]?.avgDeletionTime || 0,
      deletionsByStatus
    });
  }),

  // Get daily deletion counts
  getDailyStats: handleAsyncError(async (req, res) => {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const dailyStats = await DeletedMessage.aggregate([
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

    const formattedData = dailyStats.map(item => ({
      date: new Date(item._id.year, item._id.month - 1, item._id.day).toISOString().split('T')[0],
      count: item.count,
      avgDeletionTimeMinutes: Math.round(item.avgDeletionTime * 100) / 100
    }));

    res.json(formattedData);
  })
};