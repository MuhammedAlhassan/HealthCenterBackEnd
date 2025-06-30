import clinic from '../models/clinic.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all clinics
// @route   GET /api/v1/clinics
// @access  Public
export const getClinics = async (req, res, next) => {
  try {
    // Filtering
    let query = {};
    const { type, search, service } = req.query;

    if (type && type !== 'all') query.type = type;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (service) query.services = { $in: [service] };

    const clinics = await Clinic.find(query);
    
    res.status(200).json({
      success: true,
      count: clinics.length,
      data: clinics
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get nearby clinics
// @route   GET /api/v1/clinics/nearby
// @access  Public
export const getNearbyClinics = async (req, res, next) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    if (!longitude || !latitude) {
      return next(new ErrorResponse('Please provide longitude and latitude', 400));
    }

    const clinics = await clinic.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(20);

    res.status(200).json({
      success: true,
      count: clinics.length,
      data: clinics
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single clinic
// @route   GET /api/v1/clinics/:id
// @access  Public
export const getClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return next(new ErrorResponse(`Clinic not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: clinic
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create clinic (Admin only)
// @route   POST /api/v1/clinics
// @access  Private/Admin
export const createClinic = async (req, res, next) => {
  try {
    const clinic = await clinic.create(req.body);

    res.status(201).json({
      success: true,
      data: clinic
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update clinic (Admin only)
// @route   PUT /api/v1/clinics/:id
// @access  Private/Admin
export const updateClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!clinic) {
      return next(new ErrorResponse(`Clinic not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: clinic
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete clinic (Admin only)
// @route   DELETE /api/v1/clinics/:id
// @access  Private/Admin
export const deleteClinic = async (req, res, next) => {
  try {
    const clinic = await clinic.findByIdAndDelete(req.params.id);

    if (!clinic) {
      return next(new ErrorResponse(`Clinic not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};