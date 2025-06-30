import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  call: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Call',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Message', MessageSchema);