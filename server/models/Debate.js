const mongoose = require('mongoose');

const DebateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  transcript: [{
    sender: { type: String }, // 'user' or 'ai'
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  score: { type: Number, default: 0 },
  metrics: {
    criticalThinking: { type: Number, default: 0 },
    persuasion: { type: Number, default: 0 },
    logicScore: { type: Number, default: 0 },
    counterStrength: { type: Number, default: 0 }
  },
  feedback: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Debate', DebateSchema);
