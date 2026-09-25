const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey_speakwise_123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email: normalizedEmail,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        level: user.level,
        experiencePoints: user.experiencePoints,
        streak: user.streak,
        careerScore: user.careerScore,
        communicationDNA: user.communicationDNA,
        skills: user.skills,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
      // Manage streaks on login
      const today = new Date().toDateString();
      const lastPractice = user.lastPracticeDate ? user.lastPracticeDate.toDateString() : null;
      
      let updatedStreak = user.streak;
      if (lastPractice) {
        const diffTime = Math.abs(new Date(today) - new Date(lastPractice));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          updatedStreak += 1;
        } else if (diffDays > 1) {
          updatedStreak = 1; // reset to 1 instead of 0 for starting today
        }
      } else {
        updatedStreak = 1;
      }
      user.streak = updatedStreak;
      await user.save();

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        level: user.level,
        experiencePoints: user.experiencePoints,
        streak: user.streak,
        careerScore: user.careerScore,
        communicationDNA: user.communicationDNA,
        skills: user.skills,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        level: user.level,
        experiencePoints: user.experiencePoints,
        streak: user.streak,
        careerScore: user.careerScore,
        communicationDNA: user.communicationDNA,
        skills: user.skills,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.avatar = req.body.avatar || user.avatar;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        level: updatedUser.level,
        experiencePoints: updatedUser.experiencePoints,
        streak: updatedUser.streak,
        careerScore: updatedUser.careerScore,
        communicationDNA: updatedUser.communicationDNA,
        skills: updatedUser.skills,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
};
