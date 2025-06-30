// controllers/smsController.js
import smsReminder from '../models/smsReminder.js';
import { scheduleSMSJob, cancelSMSJob } from '../services/smsScheduler.js';
import { sendSMS } from '../services/smsService.js';

// @desc    Create SMS reminder
// @route   POST /api/sms
// @access  Private
export const createReminder = async (req, res) => {
  try {
    const { phoneNumber, message, sendDate, isRecurring, frequency } = req.body;
    
    // Validate phone number
    if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const reminder = new SMSReminder({
      userId: req.user.id,
      phoneNumber,
      message,
      sendDate: new Date(sendDate),
      isRecurring,
      frequency,
      nextSend: new Date(sendDate)
    });

    await reminder.save();

    // Schedule the SMS
    await scheduleSMSJob(reminder);

    res.status(201).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
};

// @desc    Get user's SMS reminders
// @route   GET /api/sms
// @access  Private
export const getReminders = async (req, res) => {
  try {
    const reminders = await smsReminder.find({ userId: req.user.id })
      .sort({ sendDate: 1 });

    res.status(200).json({
      success: true,
      data: reminders
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
};

// @desc    Update SMS reminder
// @route   PUT /api/sms/:id
// @access  Private
export const updateReminder = async (req, res) => {
  try {
    const reminder = await SMSReminder.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Cancel existing job
    await cancelSMSJob(reminder._id);

    // Update reminder
    const { phoneNumber, message, sendDate, isRecurring, frequency } = req.body;
    
    reminder.phoneNumber = phoneNumber;
    reminder.message = message;
    reminder.sendDate = new Date(sendDate);
    reminder.isRecurring = isRecurring;
    reminder.frequency = frequency;
    reminder.nextSend = new Date(sendDate);
    reminder.status = 'pending';

    await reminder.save();

    // Schedule new job
    await scheduleSMSJob(reminder);

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reminder' });
  }
};

// @desc    Delete SMS reminder
// @route   DELETE /api/sms/:id
// @access  Private
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await SMSReminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Cancel scheduled job
    await cancelSMSJob(reminder._id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
};