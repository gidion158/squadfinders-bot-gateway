import mongoose from 'mongoose';

const UserMessageSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    default: null
  },
  message_date: {
    type: Date,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
// UserMessageSchema.index({ user_id: 1 });
UserMessageSchema.index({ username: 1 });
UserMessageSchema.index({ message_date: 1 });

export const UserMessage = mongoose.model('UserMessage', UserMessageSchema);