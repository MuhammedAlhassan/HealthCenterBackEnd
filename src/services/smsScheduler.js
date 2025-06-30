// services/smsScheduler.js
import schedule from 'node-schedule';
import { sendSMS } from './smsService.js';

const activeJobs = new Map();

export const scheduleSMSJob = async (reminder) => {
  const job = schedule.scheduleJob(reminder.nextSend, async () => {
    await sendSMS(reminder._id);
    
    // If recurring, schedule the next one
    if (reminder.isRecurring && reminder.status === 'pending') {
      const nextJob = schedule.scheduleJob(reminder.nextSend, () => {
        sendSMS(reminder._id);
      });
      activeJobs.set(reminder._id.toString(), nextJob);
    }
  });
  
  activeJobs.set(reminder._id.toString(), job);
};

export const cancelSMSJob = (reminderId) => {
  const job = activeJobs.get(reminderId.toString());
  if (job) {
    job.cancel();
    activeJobs.delete(reminderId.toString());
  }
};

// Clean up jobs on server restart
export const initializeScheduler = async () => {
  // Cancel all existing jobs
  activeJobs.forEach(job => job.cancel());
  activeJobs.clear();
  
  // Reschedule pending reminders from database
  const pendingReminders = await SMSReminder.find({
    status: 'pending',
    nextSend: { $gte: new Date() }
  });
  
  for (const reminder of pendingReminders) {
    await scheduleSMSJob(reminder);
  }
};