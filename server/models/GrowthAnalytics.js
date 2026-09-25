const mongoose = require('mongoose');

const GrowthAnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  score: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  vocabulary: { type: Number, default: 0 },
  speaking: { type: Number, default: 0 },
  placementReadiness: { type: Number, default: 0 }
});

module.exports = mongoose.model('GrowthAnalytics', GrowthAnalyticsSchema);
