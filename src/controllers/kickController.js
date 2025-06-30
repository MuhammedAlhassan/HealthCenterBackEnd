import kickSession from '../models/kickSession.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Save a kick counting session
// @route   POST /api/kicks
// @access  Private
export const saveSession = async (req, res, next) => {
  try {
    const { duration, kickCount, goal, notes } = req.body;

    const session = await kickSession.create({
      user: req.user.id,
      duration,
      kickCount,
      goal,
      notes
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's kick session history
// @route   GET /api/kicks
// @access  Private
export const getHistory = async (req, res, next) => {
  try {
    const sessions = await kickSession.find({ user: req.user.id })
      .sort('-startTime')
      .lean() // Convert to plain JS object
      .exec();

    // Format for frontend
    const formattedSessions = sessions.map(session => ({
      id: session._id,
      date: session.startTime.toLocaleDateString(),
      time: session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: session.formattedDuration,
      kickCount: session.kickCount,
      goal: session.goal,
      notes: session.notes
    }));

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: formattedSessions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a session
// @route   DELETE /api/kicks/:id
// @access  Private
export const deleteSession = async (req, res, next) => {
  try {
    const session = await KickSession.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id // Ensure user owns this session
    });

    if (!session) {
      return next(new ErrorResponse('Session not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};