const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [String],
  correctAnswer: { type: String, required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);
