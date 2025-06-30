import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  duration: {
    type: String,
    required: [true, 'Please add duration']
  },
  thumbnail: {
    type: String,
    required: [true, 'Please add a thumbnail URL'],
    match: [/^https?:\/\/.+\..+/, 'Please use a valid URL']
  },
  videoUrl: {
    type: String,
    required: [true, 'Please add a video URL'],
    match: [/^https?:\/\/.+\..+/, 'Please use a valid URL']
  },
  categories: {
    type: [String],
    required: true,
    enum: [
      'pregnancy',
      'nutrition',
      'exercise',
      'mental-health',
      'labor',
      'postpartum'
    ]
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Video', VideoSchema);