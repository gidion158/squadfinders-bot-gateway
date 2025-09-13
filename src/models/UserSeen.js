import mongoose from 'mongoose';

const UserSeenSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    default: null
  },
  seen_ids: {
    type: [Number],
    default: []
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
UserSeenSchema.index({ active: 1 });
UserSeenSchema.index({ updatedAt: 1 });

export const UserSeen = mongoose.model('UserSeen', UserSeenSchema);