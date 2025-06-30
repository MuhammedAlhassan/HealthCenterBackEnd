// controllers/reportController.js
import medicalReport from '../models/medicalReport.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get report by appointment ID
// @route   GET /api/reports/:appointmentId
// @access  Private
export const getReportByAppointmentId = async (req, res, next) => {
  try {
    const report = await medicalReport.findOne({
      appointmentId: req.params.appointmentId,
      userId: req.user.id
    });

    if (!report) {
      return next(new ErrorResponse('Report not found', 404));
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// Other controller methods for create/update...