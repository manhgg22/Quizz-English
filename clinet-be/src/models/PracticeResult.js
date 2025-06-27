// models/PracticeResult.js
const mongoose = require('mongoose');

const practiceResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examCode: {
    type: String,
    required: true
  },
  correct: Number,
  total: Number,
  score: Number,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PracticeResult', practiceResultSchema);
