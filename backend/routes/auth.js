// routes/auth.js - Authentication routes

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../middleware/auth');
const User = require('../models/User');

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Please contact administrator.' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret_jwt_key_change_in_production',
      { expiresIn: '24h' }
    );
    
    // Add token to user's tokens array
    user.tokens.push(token);
    await user.save();
    
    // Log login activity
    const UserActivity = require('../models/UserActivity');
    await UserActivity.create({
      user: user._id,
      action: 'login',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Return user info and token
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user by invalidating the token
 * @access  Private
 */
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    // Remove the current token from the user's tokens array
    req.user.tokens = req.user.tokens.filter(token => token !== req.token);
    await req.user.save();
    
    // Log logout activity
    const UserActivity = require('../models/UserActivity');
    await UserActivity.create({
      user: req.user._id,
      action: 'logout',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices by invalidating all tokens
 * @access  Private
 */
router.post('/logout-all', authenticateUser, async (req, res) => {
  try {
    // Clear all tokens
    req.user.tokens = [];
    await req.user.save();
    
    // Log activity
    const UserActivity = require('../models/UserActivity');
    await UserActivity.create({
      user: req.user._id,
      action: 'logout-all',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (err) {
    console.error('Logout from all devices error:', err);
    res.status(500).json({ error: 'Server error during logout from all devices' });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    // Return user info (exclude sensitive data)
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.permissions,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Basic validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide current and new password' });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    req.user.password = hashedPassword;
    
    // Clear all tokens to force re-login with new password
    req.user.tokens = [];
    
    await req.user.save();
    
    // Log activity
    const UserActivity = require('../models/UserActivity');
    await UserActivity.create({
      user: req.user._id,
      action: 'change-password',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({ message: 'Password changed successfully. Please login again with your new password.' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Server error during password change' });
  }
});

/**
 * @route   POST /api/auth/reset-password-request
 * @desc    Request password reset (generates token and sends email)
 * @access  Public
 */
router.post('/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Please provide email address' });
    }
    
    const user = await User.findOne({ email });
    
    // Always return success even if user not found (security best practice)
    if (!user) {
      return res.json({ message: 'If your email is registered, you will receive password reset instructions' });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_RESET_SECRET || process.env.JWT_SECRET || 'reset_secret_key',
      { expiresIn: '1h' }
    );
    
    // Store token and expiry
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // In a real app, send email with reset link
    // For demo, just return success message
    res.json({ 
      message: 'If your email is registered, you will receive password reset instructions',
      // Remove this in production, only for demo
      resetLink: `/reset-password?token=${resetToken}`
    });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ error: 'Server error during password reset request' });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Please provide token and new password' });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_RESET_SECRET || process.env.JWT_SECRET || 'reset_secret_key'
      );
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Find user
    const user = await User.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.tokens = []; // Clear all tokens
    
    await user.save();
    
    res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

module.exports = router;