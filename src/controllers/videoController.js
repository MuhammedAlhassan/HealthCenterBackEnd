import Video from '../models/Video.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all videos
// @route   GET /api/v1/videos
// @access  Public
export const getVideos = async (req, res, next) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category) query.categories = category;

    const videos = await Video.find(query).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single video
// @route   GET /api/v1/videos/:id
// @access  Public
export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return next(new ErrorResponse(`Video not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create video (Admin only)
// @route   POST /api/v1/videos
// @access  Private/Admin
export const createVideo = async (req, res, next) => {
  try {
    const video = await Video.create(req.body);

    res.status(201).json({
      success: true,
      data: video
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update video (Admin only)
// @route   PUT /api/v1/videos/:id
// @access  Private/Admin
export const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!video) {
      return next(new ErrorResponse(`Video not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete video (Admin only)
// @route   DELETE /api/v1/videos/:id
// @access  Private/Admin
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
      return next(new ErrorResponse(`Video not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};