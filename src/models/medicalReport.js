// models/MedicalReport.js
import mongoose from 'mongoose';

const MedicalReportSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentType: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  findings: [{
    test: String,
    result: String,
    value: String,
    notes: String
  }],
  recommendations: [String],
  nextSteps: [{
    action: String,
    date: Date,
    type: String
  }],
  notes: String
}, {
  timestamps: true
});

export default mongoose.model('MedicalReport', MedicalReportSchema);