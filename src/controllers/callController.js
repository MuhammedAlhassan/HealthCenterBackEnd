import call from '../models/call.js';
import Twilio from 'twilio';
import ErrorResponse from '../utils/errorResponse.js';

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// @desc    Initiate a call
// @route   POST /api/calls/initiate
// @access  Private
export const initiateCall = async (req, res, next) => {
  try {
    const { recipient, recipientName } = req.body;
    
    // Make call using Twilio
    const call = await twilioClient.calls.create({
      url: `${process.env.SERVER_URL}/twilio/voice`,
      to: `+${recipient}`, // Your South African number: +27867769208
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.SERVER_URL}/api/calls/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });

    // Save call to database
    const newCall = await call.create({
      caller: req.user.id,
      recipient,
      recipientName,
      twilioSid: call.sid,
      status: 'initiated'
    });

    res.status(201).json({
      success: true,
      data: newCall
    });
  } catch (err) {
    next(err);
  }
};

// @desc    End a call
// @route   PUT /api/calls/:id/end
// @access  Private
export const endCall = async (req, res, next) => {
  try {
    const call = await call.findById(req.params.id);
    
    if (!call) {
      return next(new ErrorResponse('Call not found', 404));
    }

    // End call in Twilio
    await twilioClient.calls(call.twilioSid).update({ status: 'completed' });

    // Update call in database
    call.status = 'completed';
    call.endTime = new Date();
    call.duration = Math.floor((call.endTime - call.startTime) / 1000);
    await call.save();

    res.status(200).json({
      success: true,
      data: call
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Request a quick action
// @route   POST /api/calls/:id/actions
// @access  Private
export const requestAction = async (req, res, next) => {
  try {
    const { actionType, notes } = req.body;
    
    const call = await call.findById(req.params.id);
    
    if (!call) {
      return next(new ErrorResponse('Call not found', 404));
    }

    call.quickActions.push({ type: actionType, notes });
    await call.save();

    // Emit socket event
    req.io.to(req.params.id).emit('call-update', {
      type: 'action-requested',
      actionType,
      notes
    });

    res.status(200).json({
      success: true,
      data: call.quickActions
    });
  } catch (err) {
    next(err);
  }
};