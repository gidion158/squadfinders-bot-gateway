import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  message_id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  message_date: {
    type: Date,
    required: true,
    index: true
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
  message: { type: String, default: null }
}, {
  timestamps: true
});

// Compound index for group and message
MessageSchema.index({ 'group.group_id': 1, message_id: 1 }, { unique: true });

// Additional indexes for better query performance
MessageSchema.index({ 'group.group_username': 1 });
MessageSchema.index({ 'sender.username': 1 });

export const Message = mongoose.model('Message', MessageSchema);