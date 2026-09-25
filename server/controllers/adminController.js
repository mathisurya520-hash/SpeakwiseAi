const User = require('../models/User');
const Report = require('../models/Report');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system status & metrics (admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalReports = await Report.countDocuments({});
    const reports = await Report.find({});
    
    const averageScore = reports.length > 0
      ? Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length)
      : 0;

    const moduleDistribution = {
      analyzer: 0,
      gd: 0,
      'public-speaking': 0,
      presentation: 0,
      email: 0,
      interview: 0,
      debate: 0
    };

    reports.forEach(r => {
      if (moduleDistribution[r.moduleType] !== undefined) {
        moduleDistribution[r.moduleType]++;
      }
    });

    res.json({
      totalUsers,
      totalReports,
      averageScore,
      moduleDistribution,
      aiUsage: {
        totalCalls: totalReports,
        liveCalls: process.env.GEMINI_API_KEY ? totalReports : 0,
        mockCalls: process.env.GEMINI_API_KEY ? 0 : totalReports
      },
      systemStatus: {
        database: 'Connected',
        apiServer: 'Healthy',
        geminiApi: process.env.GEMINI_API_KEY ? 'Active (Live)' : 'Active (Simulation Fallback)'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user role (admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const toggleUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();

    res.json({ message: `User role changed to ${user.role}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getSystemStats,
  toggleUserRole,
  deleteUser
};
