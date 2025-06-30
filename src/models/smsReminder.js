// models/SMSReminder.js
import mongoose from 'mongoose';

const SMSReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 160
  },
  sendDate: {
    type: Date,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'canceled'],
    default: 'pending'
  },
  lastSent: Date,
  nextSend: Date
}, {
  timestamps: true
});

// Index for faster querying
SMSReminderSchema.index({ userId: 1 });
SMSReminderSchema.index({ nextSend: 1, status: 1 });

export default mongoose.model('SMSReminder', SMSReminderSchema);