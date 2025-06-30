import mongoose from 'mongoose';

const KickSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  duration: {  // in seconds
    type: Number,
    required: true
  },
  kickCount: {
    type: Number,
    required: true
  },
  goal: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Add virtual for formatted duration (MM:SS)
KickSessionSchema.virtual('formattedDuration').get(function() {
  const mins = Math.floor(this.duration / 60);
  const secs = this.duration % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

export default mongoose.model('KickSession', KickSessionSchema);