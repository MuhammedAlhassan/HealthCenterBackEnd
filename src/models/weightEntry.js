import mongoose from 'mongoose';

const WeightEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 30,
    max: 200
  },
  unit: {
    type: String,
    enum: ['kg', 'lbs'],
    default: 'kg'
  },
  pregnancyWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 42
  },
  notes: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Add index for faster queries
WeightEntrySchema.index({ userId: 1, date: -1 });

export default mongoose.model('WeightEntry', WeightEntrySchema);