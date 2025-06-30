import mongoose from 'mongoose';

const CallSchema = new mongoose.Schema({
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  recipientName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'in-progress', 'completed', 'missed'],
    default: 'initiated'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number
  },
  twilioSid: {
    type: String
  },
  quickActions: [{
    type: {
      type: String,
      enum: ['prescription', 'records', 'followup']
    },
    status: {
      type: String,
      enum: ['requested', 'fulfilled', 'denied'],
      default: 'requested'
    },
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

export default mongoose.model('Call', CallSchema);  