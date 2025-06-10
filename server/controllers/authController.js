const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Required if matchPassword is not used from model

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Expires in 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { username, email, password, privacySettings } = req.body;

  try {
    // Check if user already exists (by email or username)
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user instance
    user = new User({
      username,
      email,
      password,
      privacySettings // Optional, defaults will apply if not provided
    });

    // Password hashing is handled by pre-save middleware in User.js

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      privacySettings: user.privacySettings,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    // Forward to error handling middleware if you have one, or send generic error
    res.status(500).json({ message: 'Server error during registration' });
    // next(error); // if you have error handling middleware
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check for user by email
    const user = await User.findOne({ email }).select('+password'); // Explicitly select password

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials - user not found' });
    }

    // Check if password matches
    // The matchPassword method is defined in User.js model
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials - password incorrect' });
    }

    // User authenticated, generate token
    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      privacySettings: user.privacySettings,
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
    // next(error); // if you have error handling middleware
  }
};

module.exports = {
  registerUser,
  loginUser, // Add loginUser to exports
};
