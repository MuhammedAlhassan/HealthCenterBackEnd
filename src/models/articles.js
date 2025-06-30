import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  excerpt: {
    type: String,
    required: [true, 'Please add an excerpt'],
    maxlength: [200, 'Excerpt cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  readTime: {
    type: String,
    required: [true, 'Please add read time']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'pregnancy',
      'nutrition',
      'exercise',
      'mental-health',
      'labor',
      'postpartum'
    ]
  },
  subCategory: {
    type: String,
    required: [true, 'Please add a sub-category']
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL'],
    match: [/^https?:\/\/.+\..+/, 'Please use a valid URL']
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model('Article', ArticleSchema);