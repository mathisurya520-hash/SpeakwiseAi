const mongoose = require('mongoose');

const CommunicationScoresSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  overall: { type: Number, required: true },
  confidence: { type: Number, required: true },
  fluency: { type: Number, required: true },
  grammar: { type: Number, required: true },
  vocabulary: { type: Number, required: true }
});

module.exports = mongoose.model('CommunicationScores', CommunicationScoresSchema);
