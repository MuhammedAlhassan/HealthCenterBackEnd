import mongoose from 'mongoose';

const DashboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  widgets: [{
    widgetType: {
      type: String,
      enum: ['appointments', 'pregnancyTracker', 'emergency', 'healthTips', 'voiceChecks'],
      required: true
    },
    position: Number,
    isVisible: {
      type: Boolean,
      default: true
    },
    config: mongoose.Schema.Types.Mixed
  }],
  lastAccessed: Date,
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'light'
  }
}, {
  timestamps: true
});

// Indexes
DashboardSchema.index({ userId: 1 });

export const Dashboard = mongoose.model('Dashboard', DashboardSchema);