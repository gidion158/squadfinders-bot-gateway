import { DeletedMessageStats, DailyDeletion } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';

export const deletedMessageController = {
  // Get deletion statistics
  getStats: handleAsyncError(async (req, res) => {
    const stats = await DeletedMessageStats.findOne();
    
    if (!stats) {
      return res.json({
        totalDeleted: 0,
        deletedToday: 0,
        avgDeletionTimeSeconds: 0
      });
    }

    res.json({
      totalDeleted: stats.totalDeleted,
      deletedToday: stats.deletedToday
    });
  }),

  // Get daily deletion counts for charts
  getDailyStats: handleAsyncError(async (req, res) => {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const dailyStats = await DailyDeletion.find({
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const formattedData = dailyStats.map(item => ({
      date: item.date.toISOString().split('T')[0],
      count: item.count
    }));

    res.json(formattedData);
  }),

  // Get deletion chart data with time grouping
  getChartData: handleAsyncError(async (req, res) => {
    const { timeframe = '7d' } = req.query;
    
    // Parse timeframe
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
      default:
        milliseconds = value * 30 * 24 * 60 * 60 * 1000; // months
        break;
    }

    const startDate = new Date(Date.now() - milliseconds);

    const dailyStats = await DailyDeletion.find({
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const formattedData = dailyStats.map(item => ({
      date: item.date.toISOString(),
      count: item.count
    }));

    res.json(formattedData);
  })
};