import { User } from '../models/user.js';
import { Dashboard } from '../models/dashboard.js';
import { generateToken, verifyToken } from '../config/jwt.js';
import { sendOTPEmail, sendResetEmail } from '../utils/emailService.js';

const sayHello = async(req, res)=>{
  res.send("Hello")
}

// @desc    Register user with automatic dashboard creation
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  const { firstName, lastName, phone, email, userType, dueDate, password, address } = req.body;
  
  // Validate required fields
  if (!firstName || !lastName || !phone || !email || !password) {
    return res.status(400).json({ 
      success: false,
      error: "Missing required fields" 
    });
  }

  try {

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User already exists"
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      phone,
      email,
      userType: userType || 'expectant-mother',
      address,
      dueDate: userType === 'expectant-mother' ? dueDate : undefined,
      password
    });

    // // Generate OTP
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // user.otp = otp;
    // user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // // Create default dashboard
    // const defaultWidgets = userType === 'healthcare-provider' 
    //   ? [
    //       { widgetType: 'appointments', position: 1 },
    //       { widgetType: 'emergency', position: 2 }
    //     ]
    //   : [
    //       { widgetType: 'appointments', position: 1 },
    //       { widgetType: 'pregnancyTracker', position: 2 },
    //       { widgetType: 'emergency', position: 3 }
    //     ];

    // await Dashboard.create({ userId: user._id, widgets: defaultWidgets });

    // // Send OTP email
    // await sendOTPEmail(email, otp);

    // // Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: "Registration failed",
      details: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    
    const user = await User.findOne({
       email: email 
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Verify password
    // const isMatch = await user.comparePassword(password);
    // if (!isMatch) {
    //   return res.status(401).json({
    //     success: false,
    //     error: "Invalid credentials"
    //   });
    // }

    // // Check if verified (if you're using OTP verification)
    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     error: "Account not verified",
    //     requiresVerification: true,
    //     userId: user._id
    //   });
    // }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: "Login failed",
      details: error.message
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Private
const verifyOTP = async (req, res) => {
  const { otp, userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP"
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Generate new token after verification
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        isVerified: true
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({
      success: false,
      error: "OTP verification failed",
      details: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No user found with this email"
      });
    }

    const resetToken = generateToken(user._id);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    await sendResetEmail(email, resetToken);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent"
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      error: "Password reset failed",
      details: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  const { resettoken } = req.params;
  const { password } = req.body;

  try {
    const decoded = verifyToken(resettoken);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: resettoken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired token"
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      error: "Password reset failed",
      details: error.message
    });
  }
};

// @desc    Logout user
// @route   GET /api/v1/auth/logout
// @access  Private
const logout = async (req, res) => {
  // Note: JWT is stateless, actual invalidation requires additional logic
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

export { 
  register, 
  login, 
  verifyOTP, 
  forgotPassword, 
  resetPassword, 
  logout ,
  sayHello
};