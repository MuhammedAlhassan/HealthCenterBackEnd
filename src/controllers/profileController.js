import { user } from '../models/user.js';
import asyncHandler from 'express-async-handler';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await user.findById(req.user._id)
    .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpire');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json(user);
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    bio,
    address,
    healthProfile,
    emergencyContacts
  } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      firstName,
      lastName,
      phone,
      bio,
      address,
      healthProfile,
      emergencyContacts
    },
    { new: true, runValidators: true }
  ).select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpire');

  res.status(200).json(user);
});

// @desc    Upload profile picture
// @route   POST /api/profile/picture
// @access  Private
const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  // Upload to Cloudinary or your preferred storage
  const result = await uploadToCloudinary(req.file.path, {
    folder: 'profile-pictures',
    width: 500,
    height: 500,
    crop: 'fill'
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePicture: result.secure_url },
    { new: true }
  ).select('profilePicture');

  res.status(200).json({
    message: 'Profile picture uploaded successfully',
    profilePicture: user.profilePicture
  });
});

// @desc    Update health profile
// @route   PUT /api/profile/health
// @access  Private
const updateHealthProfile = asyncHandler(async (req, res) => {
  const { height, weight, bloodType, allergies, preExistingConditions, medications } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { 
      healthProfile: {
        height,
        weight,
        bloodType,
        allergies,
        preExistingConditions,
        medications
      }
    },
    { new: true, runValidators: true }
  ).select('healthProfile');

  res.status(200).json(user.healthProfile);
});

export { 
  getProfile, 
  updateProfile, 
  uploadProfilePicture,
  updateHealthProfile
};