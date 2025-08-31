import mongoose from 'mongoose';

const AIResponseSchema = new mongoose.Schema({
  message_id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  message: {
    type: String,
    default: null
  },
  is_lfg: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Additional indexes for better query performance
AIResponseSchema.index({ is_lfg: 1 });
AIResponseSchema.index({ message_id: 1 });

export const AIResponse = mongoose.model('AIResponse', AIResponseSchema);