import mongoose from 'mongoose';

const EmergencySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'responded', 'completed'],
    default: 'pending'
  },
  emergencyType: {
    type: String,
    enum: ['maternal', 'accident', 'cardiac', 'other'],
    required: true
  },
  additionalInfo: String,
  responders: [{
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic'
    },
    status: {
      type: String,
      enum: ['notified', 'enroute', 'on-site', 'completed']
    },
    responseTime: Date
  }],
  resolvedAt: Date
}, { 
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true } 
});

// Geospatial index
EmergencySchema.index({ location: '2dsphere' });

// Virtual for formatted address (reverse geocode in controller)
EmergencySchema.virtual('address').get(function() {
  return this._address || 'Location not specified';
});

export default mongoose.model('Emergency', EmergencySchema);