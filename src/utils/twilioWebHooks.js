import express from 'express';
import call from '../models/call.js';

const router = express.Router();

// Handle Twilio call status updates
router.post('/status', async (req, res) => {
  const { CallSid, CallStatus } = req.body;
  
  try {
    const call = await Call.findOne({ twilioSid: CallSid });
    
    if (call) {
      call.status = CallStatus;
      
      if (CallStatus === 'in-progress') {
        call.startTime = new Date();
      } else if (CallStatus === 'completed') {
        call.endTime = new Date();
        call.duration = Math.floor((call.endTime - call.startTime) / 1000);
      }
      
      await call.save();
    }
    
    res.status(200).end();
  } catch (err) {
    console.error('Error updating call status:', err);
    res.status(500).end();
  }
});

// TwiML for call handling
router.post('/voice', (req, res) => {
  const response = new Twilio.twiml.VoiceResponse();
  
  // Dial the doctor's number (your number)
  response.dial({
    callerId: process.env.TWILIO_PHONE_NUMBER,
    action: '/api/twilio/call-ended'
  }, '+27867769208'); // Your South African number
  
  res.type('text/xml');
  res.send(response.toString());
});

// Handle call ended
router.post('/call-ended', (req, res) => {
  // You can add additional logic here if needed
  res.status(200).end();
});

export default router;