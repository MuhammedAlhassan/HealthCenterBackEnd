import express from 'express';
import { register, forgotPassword, login, resetPassword, logout, sayHello } from '../controllers/authController.js';

const authRoutes = express.Router();
console.log("Router is running")
// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
authRoutes.post('/register', register);

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Private (requires temporary token from registration)
// authRoutes.post('/verify-otp', protect, verifyOTP);

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
authRoutes.post('/login', login);

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
authRoutes.post('/forgotpassword', forgotPassword);

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
authRoutes.put('/resetpassword/:resettoken', resetPassword);

// @desc    Logout user
// @route   GET /api/v1/auth/logout
// @access  Private
authRoutes.get('/logout', logout);

export default authRoutes;