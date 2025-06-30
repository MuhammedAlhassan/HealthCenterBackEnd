// services/smsService.js
import axios from 'axios';
import smsReminder from '../models/smsReminder.js';

// Mock SMS service - replace with actual SMS gateway integration
export const sendSMS = async (reminderId) => {
  try {
    const reminder = await smsReminder.findById(reminderId);
    
    if (!reminder) {
      console.error('Reminder not found');
      return false;
    }

    // In a real implementation, this would call your SMS gateway API
    console.log(`Sending SMS to ${reminder.phoneNumber}: ${reminder.message}`);
    
    // Update reminder status
    reminder.status = 'sent';
    reminder.lastSent = new Date();
    
    if (reminder.isRecurring) {
      // Calculate next send date
      const nextSend = new Date(reminder.nextSend);
      switch (reminder.frequency) {
        case 'daily':
          nextSend.setDate(nextSend.getDate() + 1);
          break;
        case 'weekly':
          nextSend.setDate(nextSend.getDate() + 7);
          break;
        case 'monthly':
          nextSend.setMonth(nextSend.getMonth() + 1);
          break;
      }
      reminder.nextSend = nextSend;
      reminder.status = 'pending';
    }
    
    await reminder.save();
    
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    // Update reminder status if failed
    await SMSReminder.findByIdAndUpdate(reminderId, {
      status: 'failed'
    });
    
    return false;
  }
};