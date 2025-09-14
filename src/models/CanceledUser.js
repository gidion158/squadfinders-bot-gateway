import mongoose from 'mongoose';

const CanceledUserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
// CanceledUserSchema.index({ user_id: 1 });
CanceledUserSchema.index({ username: 1 });

export const CanceledUser = mongoose.model('CanceledUser', CanceledUserSchema);