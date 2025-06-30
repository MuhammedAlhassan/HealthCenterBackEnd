import mongoose from 'mongoose';

const VoiceAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transcript: {
    type: String,
    required: true
  },
  analysis: {
    possibleConditions: [{
      name: String,
      confidence: Number
    }],
    recommendedActions: [String],
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'emergency']
    },
    shouldSeeDoctor: Boolean,
    immediateConcerns: Boolean,
    confidenceScore: Number
  },
  sessionId: String,
  language: {
    type: String,
    default: 'en-US'
  }
}, {
  timestamps: true
});

export default mongoose.model('VoiceAnalysis', VoiceAnalysisSchema);