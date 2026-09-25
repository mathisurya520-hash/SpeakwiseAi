const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'avatar1' },
  role: { type: String, default: 'user' }, // admin, user
  level: { type: Number, default: 1 },
  experiencePoints: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  careerScore: { type: Number, default: 50 }, // placement readiness score (0-100)
  communicationDNA: {
    archetype: { type: String, default: 'Unexplored' },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    description: { type: String, default: 'Practice to unlock your AI Communication DNA.' }
  },
  skills: {
    confidence: { type: Number, default: 50 },
    fluency: { type: Number, default: 50 },
    speakingSpeed: { type: Number, default: 50 },
    fillerWords: { type: Number, default: 0 },
    grammar: { type: Number, default: 50 },
    pronunciation: { type: Number, default: 50 },
    vocabulary: { type: Number, default: 50 },
    tone: { type: Number, default: 50 },
    clarity: { type: Number, default: 50 }
  },
  lastPracticeDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
