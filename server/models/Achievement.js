const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'trophy' },
  unlockedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Achievement', AchievementSchema);
