const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobTitle: { type: String, required: true },
  questions: [{ type: String }],
  answers: [{ type: String }],
  scores: {
    confidence: { type: Number, default: 0 },
    professionalism: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
    vocabulary: { type: Number, default: 0 },
    bodyLanguage: { type: Number, default: 0 },
    overall: { type: Number, default: 0 }
  },
  feedback: { type: String, default: '' },
  readinessScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', InterviewSchema);
