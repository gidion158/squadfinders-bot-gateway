import mongoose from 'mongoose';

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

// Index for better query performance
// DailyDeletionSchema.index({ date: 1 });

export const DeletedMessageStats = mongoose.model('DeletedMessageStats', DeletedMessageStatsSchema);
export const DailyDeletion = mongoose.model('DailyDeletion', DailyDeletionSchema);