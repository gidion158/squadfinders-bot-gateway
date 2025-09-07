import mongoose from 'mongoose';

const PrefilterResultSchema = new mongoose.Schema({
  message_id: {
    type: Number,
    required: true,
    unique: true,
  },
  message: {
    type: String,
    required: true,
  },
  message_date: {
    type: Date,
    required: true,
  },
  maybe_lfg: {
    type: Boolean,
    required: true,
    default: false
  },
  confidence: {
    type: Number,
    required: true,
    min: 0.0,
    max: 1.0,
    validate: {
      validator: function(v) {
        return v >= 0.0 && v <= 1.0;
      },
      message: 'Confidence must be between 0.0 and 1.0'
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
// PrefilterResultSchema.index({ message_id: 1 });
PrefilterResultSchema.index({ message_date: 1 });
PrefilterResultSchema.index({ maybe_lfg: 1 });
PrefilterResultSchema.index({ confidence: 1 });

export const PrefilterResult = mongoose.model('PrefilterResult', PrefilterResultSchema);