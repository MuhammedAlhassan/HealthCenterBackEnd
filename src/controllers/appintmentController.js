import Appointment from '../models/appointment.js';
import User from '../models/user.js';

// Helper function for date validation
const isValidDate = (date) => {
  return new Date(date) > new Date();
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id });
    res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' }, 'name specialty');
    res.status(200).json({ success: true, data: providers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { type, date, time, provider, notes } = req.body;
    
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'Date must be in the future' });
    }

    const appointment = await Appointment.create({
      user: req.user.id,
      type,
      date: new Date(date),
      time,
      provider,
      location: 'Main Hospital', // Default location
      notes,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};