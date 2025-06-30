import { Dashboard } from '../models/dashboard.js';
import { User } from '../models/user.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get user dashboard
// @route   GET /api/v1/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.findOne({ userId: req.user.id })
      .populate({
        path: 'userId',
        select: 'firstName lastName email userType pregnancyWeek appointments emergencyContacts address'
      });

    if (!dashboard) {
      return next(new ErrorResponse('Dashboard not found', 404));
    }

    res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update dashboard
// @route   PUT /api/v1/dashboard
// @access  Private
export const updateDashboard = async (req, res, next) => {
  try {
    const { theme, widgets } = req.body;

    const dashboard = await Dashboard.findOneAndUpdate(
      { userId: req.user.id },
      { theme, widgets, lastAccessed: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (err) {
    next(err);
  }
};