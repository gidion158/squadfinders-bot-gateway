import mongoose from 'mongoose';

const DeletedMessageSchema = new mongoose.Schema({
  original_message_id: {
    type: Number,
    required: true,
  },
  message_date: {
    type: Date,
    required: true,
  },
  deleted_at: {
    type: Date,
    required: true,
    default: Date.now
  },
  sender: {
    id: { type: String, default: null },
    username: { type: String, default: null },
    name: { type: String, default: null }
  },
  group: {
    group_id: { type: String, default: null },
    group_title: { type: String, default: null },
    group_username: { type: String, default: null }
  },
  message: { type: String, default: null },
  is_valid: { type: Boolean, default: false },
  is_lfg: { type: Boolean, default: false },
  reason: { type: String, default: null },
  ai_status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  // Time between message creation and deletion (in minutes)
  deletion_time_minutes: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
DeletedMessageSchema.index({ deleted_at: 1 });
DeletedMessageSchema.index({ original_message_id: 1 });
DeletedMessageSchema.index({ 'group.group_username': 1 });
DeletedMessageSchema.index({ 'sender.username': 1 });
DeletedMessageSchema.index({ is_valid: 1 });
DeletedMessageSchema.index({ deletion_time_minutes: 1 });

export const DeletedMessage = mongoose.model('DeletedMessage', DeletedMessageSchema);