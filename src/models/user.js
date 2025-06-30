import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema({
  // Basic Profile Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  
  // Profile Display
  profilePicture: {
    type: String,
    default: 'default-profile.jpg'
  },
  bio: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // User Type Specific Data
  userType: {
    type: String,
    enum: ['expectant-mother', 'healthcare-provider', 'admin'],
    default: 'expectant-mother'
  },
  dueDate: {
    type: Date,
    required: function() {
      return this.userType === 'expectant-mother';
    }
  },
  pregnancyWeek: {
    type: Number,
    min: 0,
    max: 42,
    default: 0
  },
  
  // Location Information
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  timezone: String,
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  
  // Health Profile
  healthProfile: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
      default: null
    },
    height: { // in centimeters
      type: Number,
      min: 100,
      max: 250
    },
    weight: { // in kilograms
      type: Number,
      min: 30,
      max: 200
    },
    allergies: [{
      name: String,
      severity: String,
      notes: String
    }],
    preExistingConditions: [{
      name: String,
      diagnosisDate: Date,
      treatment: String
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      prescribedBy: String
    }]
  },
  
  // Emergency Contacts
  emergencyContacts: [{
    name: String,
    relationship: String,
    phoneNumber: String,
    email: String,
    isPrimary: Boolean,
    notes: String
  }],
  
  // Appointments
  appointments: [{
    date: Date,
    title: String,
    description: String,
    location: String,
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'canceled', 'completed'],
      default: 'pending'
    },
    reminders: [{
      method: String, // 'email', 'sms', 'push'
      timeBefore: Number, // in minutes
      sent: Boolean
    }]
  }],
  
  // System Fields
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    date: Date,
    device: String,
    ipAddress: String
  }],
  
  // Security Fields
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive information
      delete ret.password;
      delete ret.otp;
      delete ret.otpExpires;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpire;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.otp;
      delete ret.otpExpires;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpire;
      return ret;
    }
  }
});

// Virtuals
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

UserSchema.virtual('bmi').get(function() {
  if (!this.healthProfile?.height || !this.healthProfile?.weight) return null;
  const heightInMeters = this.healthProfile.height / 100;
  return (this.healthProfile.weight / (heightInMeters * heightInMeters)).toFixed(1);
});

// Pre-save hooks
UserSchema.pre('save', async function(next) {
  // Hash password if modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Update pregnancy week automatically based on due date
UserSchema.pre('save', function(next) {
  if (this.isModified('dueDate') && this.dueDate) {
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.pregnancyWeek = Math.max(0, Math.min(42, 40 - Math.floor(diffDays / 7)));
  }
  next();
});

// Methods
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Static methods
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

export const User = mongoose.model('User', UserSchema);