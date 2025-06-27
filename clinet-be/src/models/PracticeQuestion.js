// models/PracticeQuestion.js
const mongoose = require('mongoose');

const practiceQuestionSchema = new mongoose.Schema({
  topic: String,
  question: String,
  options: [String],
  correctAnswer: String,
  examCode: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PracticeQuestion', practiceQuestionSchema);
