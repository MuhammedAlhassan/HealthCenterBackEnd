import mongoose from 'mongoose';

const ClinicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a clinic name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['Hospital', 'Clinic', 'Primary Care', 'Specialty Center'],
    default: 'Clinic'
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    match: [/^\+?[\d\s-]+$/, 'Please enter a valid phone number']
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) => value.length === 2 && 
                  value[0] >= -180 && value[0] <= 180 && 
                  value[1] >= -90 && value[1] <= 90,
        message: 'Invalid coordinates'
      }
    }
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 3
  },
  services: {
    type: [String],
    required: true,
    validate: {
      validator: (value) => value.length > 0,
      message: 'Please add at least one service'
    }
  },
  specialties: [String],
  availability: {
    type: String,
    default: 'Mon-Fri 8AM-5PM'
  },
  image: {
    type: String,
    match: [/^https?:\/\/.+\..+/, 'Please use a valid URL']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Geospatial indexing
ClinicSchema.index({ location: '2dsphere' });

// Virtual for distance (will be populated in controller)
ClinicSchema.virtual('distance').get(function() {
  return this._distance;
});

export default mongoose.model('Clinic', ClinicSchema);