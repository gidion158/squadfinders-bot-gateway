import mongoose from 'mongoose';

const GamingGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
GamingGroupSchema.index({ active: 1 });
GamingGroupSchema.index({ name: 1 });

export const GamingGroup = mongoose.model('GamingGroup', GamingGroupSchema);