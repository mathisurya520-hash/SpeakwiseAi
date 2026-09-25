const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalContent: { type: String, required: true },
  convertedContent: { type: String, default: '' },
  fromTone: { type: String, default: 'Casual' },
  toTone: { type: String, default: 'Professional' },
  grammarErrors: [{
    error: { type: String },
    correction: { type: String },
    explanation: { type: String }
  }],
  suggestions: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Email', EmailSchema);
