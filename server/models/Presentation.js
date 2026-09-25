const mongoose = require('mongoose');

const PresentationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  fileName: { type: String },
  slideCount: { type: Number, default: 1 },
  scores: {
    design: { type: Number, default: 0 },
    readability: { type: Number, default: 0 },
    structure: { type: Number, default: 0 },
    professionalism: { type: Number, default: 0 },
    hierarchy: { type: Number, default: 0 },
    effectiveness: { type: Number, default: 0 },
    overall: { type: Number, default: 0 }
  },
  speakerNotes: [{
    slideNumber: { type: Number },
    notes: { type: String }
  }],
  presentationScript: { type: String, default: '' },
  expectedQuestions: [{
    question: { type: String },
    suggestedAnswer: { type: String }
  }],
  suggestions: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Presentation', PresentationSchema);
