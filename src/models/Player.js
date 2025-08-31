import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
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
  message: { type: String, default: null },
  platform: {
    type: String,
    enum: ['PC', 'Console', 'unknown'],
    default: 'unknown'
  },
  rank: { type: String, default: 'unknown' },
  players_count: { type: Number, default: 0 },
  game_mode: { type: String, default: 'unknown' },
  active: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Compound index for group and message
PlayerSchema.index({ 'group.group_id': 1, message_id: 1 }, { unique: true });

// Additional indexes for better query performance
PlayerSchema.index({ platform: 1 });
PlayerSchema.index({ active: 1 });

export const Player = mongoose.model('Player', PlayerSchema);