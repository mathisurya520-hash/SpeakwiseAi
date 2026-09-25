const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moduleType: { type: String, required: true }, // analyzer, public-speaking, presentation, gd, debate, interview, email
  title: { type: String, required: true },
  overallScore: { type: Number, required: true },
  metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
  feedback: { type: String, default: '' },
  suggestions: { type: [String], default: [] },
  transcript: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
