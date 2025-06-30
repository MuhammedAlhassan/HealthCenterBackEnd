// utils/twilio.js
import twilio from 'twilio';

export const sendEmergencySMS = (to, message) => {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  
  return client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to
  });
};

export const makeEmergencyCall = (to, twimlUrl) => {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  
  return client.calls.create({
    url: twimlUrl,
    from: process.env.TWILIO_PHONE,
    to
  });
};