// models/PracticeQuestion.js
const mongoose = require('mongoose');

const practiceQuestionSchema = new mongoose.Schema({
  topic: String,
  question: String,
  options: [String],
  correctAnswer: String,
  examCode: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  // ✅ Thêm thời gian (phút)
  duration: {
    type: Number, // đơn vị phút
    default: 10   // nếu không chọn thì mặc định 10 phút
  }
});

module.exports = mongoose.model('PracticeQuestion', practiceQuestionSchema);
