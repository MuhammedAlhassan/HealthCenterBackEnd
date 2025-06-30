import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['routine', 'ultrasound', 'blood-test', 'consultation', 'emergency'],
    default: 'routine'
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
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
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
AppointmentSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

// Virtual for checking if appointment is upcoming
AppointmentSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const appointmentDateTime = new Date(
    this.date.getFullYear(),
    this.date.getMonth(),
    this.date.getDate(),
    ...this.time.split(':').map(Number)
  );
  return appointmentDateTime > now && this.status !== 'completed' && this.status !== 'cancelled';
});

// Middleware to update status after 24 hours
AppointmentSchema.post('save', async function(doc) {
  const appointmentDateTime = new Date(
    doc.date.getFullYear(),
    doc.date.getMonth(),
    doc.date.getDate(),
    ...doc.time.split(':').map(Number)
  );
  const now = new Date();
  const diffHours = (appointmentDateTime - now) / (1000 * 60 * 60);

  if (diffHours < 24 && doc.status === 'confirmed') {
    setTimeout(async () => {
      const updatedAppointment = await mongoose.model('Appointment').findById(doc._id);
      if (updatedAppointment && updatedAppointment.status === 'confirmed') {
        updatedAppointment.status = 'completed';
        await updatedAppointment.save();
      }
    }, diffHours * 60 * 60 * 1000);
  }
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

export default Appointment;