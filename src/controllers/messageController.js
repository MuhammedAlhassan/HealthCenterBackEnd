import message from '../models/message.js';
import call from '../models/call.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get messages for a call
// @route   GET /api/messages/:callId
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ call: req.params.callId })
      .sort('timestamp')
      .populate('sender', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { callId, content } = req.body;
    
    const call = await call.findById(callId);
    
    if (!call) {
      return next(new ErrorResponse('Call not found', 404));
    }

    const message = await message.create({
      call: callId,
      sender: req.user.id,
      content
    });

    // Emit socket event
    req.io.to(callId).emit('receive-message', {
      callId,
      sender: req.user.id,
      content,
      timestamp: message.timestamp
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (err) {
    next(err);
  }
};