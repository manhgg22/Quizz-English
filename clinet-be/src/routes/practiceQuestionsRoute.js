const express = require('express');
const router = express.Router();
const PracticeQuestion = require('../models/PracticeQuestion');
const PracticeResult = require('../models/PracticeResult'); // ✅ NEW
const authMiddleware = require('../middleware/authMiddleware');

// ✅ [1] Admin tạo câu hỏi ôn tập
router.post('/', authMiddleware(true), async (req, res) => {
  try {
    const { topic, examCode, questions, duration } = req.body;

    if (!topic || !examCode || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Thiếu thông tin hoặc mảng câu hỏi không hợp lệ' });
    }

    // Kiểm tra từng câu hỏi có đủ dữ liệu
    const invalid = questions.some(q =>
      !q.question || !q.correctAnswer || !Array.isArray(q.options) || q.options.length !== 4
    );

    if (invalid) {
      return res.status(400).json({ message: 'Một số câu hỏi thiếu thông tin hoặc không hợp lệ' });
    }

    // Chuẩn hóa từng câu hỏi trước khi insert
    const formattedQuestions = questions.map(q => ({
      topic,
      examCode,
      duration: duration || 10, // ✅ Thêm trường thời gian mặc định 10 phút nếu không truyền
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));

    // Thêm tất cả câu hỏi vào DB
    const result = await PracticeQuestion.insertMany(formattedQuestions);

    res.status(201).json({
      message: `Tạo ${result.length} câu hỏi thành công`,
      count: result.length,
      examCode,
      topic,
      duration: duration || 10
    });
  } catch (err) {
    console.error('Lỗi khi tạo nhiều câu hỏi ôn tập:', err);
    res.status(500).json({ message: 'Tạo câu hỏi ôn tập thất bại' });
  }
});




router.get('/access', authMiddleware(), async (req, res) => {
  try {
    const { examCode } = req.query;

    if (!examCode) {
      return res.status(400).json({ message: 'Thiếu examCode' });
    }

    // ✅ Kiểm tra user đã làm bài này chưa
    const existingResult = await PracticeResult.findOne({ 
      userId: req.user.id, 
      examCode 
    });

    if (existingResult) {
      return res.status(400).json({ 
        message: 'Bạn đã hoàn thành bài thi này',
        alreadySubmitted: true 
      });
    }

    const questions = await PracticeQuestion.find({ examCode });

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }

    // ✅ Ẩn đáp án đúng khi trả về cho học sinh
    const safeQuestions = questions.map(q => ({
      _id: q._id,
      topic: q.topic,
      question: q.question,
      options: q.options
    }));

    // ✅ Trả về format mà frontend mong đợi
    res.json({
      questions: safeQuestions,
      duration: questions[0]?.duration || 10, // Lấy duration từ câu hỏi đầu tiên
      topic: questions[0]?.topic,
      examCode: examCode,
      totalQuestions: questions.length,
      alreadySubmitted: false
    });

  } catch (err) {
    console.error('Lỗi lấy câu hỏi:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// ✅ [3] User nộp bài & chấm điểm
router.post('/submit', authMiddleware(), async (req, res) => {
  try {
    const { examCode, answers } = req.body;
    const userId = req.user.id;

    if (!examCode || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Thiếu dữ liệu nộp bài' });
    }

    const questions = await PracticeQuestion.find({ examCode });
    if (questions.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài luyện tập' });
    }

    let correctCount = 0;

    questions.forEach((q) => {
      const userAnswer = answers.find(a => a.questionId === q._id.toString());
      if (userAnswer && userAnswer.answer === q.correctAnswer) {
        correctCount++;
      }
    });

    const total = questions.length;
    const score = (correctCount / total) * 10;

    // ✅ Lưu kết quả vào MongoDB
    const result = await PracticeResult.create({
      userId,
      examCode,
      correct: correctCount,
      total,
      score: Number(score.toFixed(2))
    });

    res.json({
      message: 'Nộp bài thành công',
      correct: correctCount,
      total,
      score: result.score
    });
  } catch (err) {
    console.error('Lỗi khi nộp bài luyện tập:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});
// ✅ [4] User hủy bài thi
router.post('/cancel', authMiddleware(), async (req, res) => {
  try {
    const { examCode } = req.body;
    const userId = req.user.id;

    // Có thể lưu log hủy bài hoặc đánh dấu
    // const cancelLog = await PracticeCancelLog.create({ userId, examCode, canceledAt: new Date() });

    res.json({ message: 'Bài thi đã được hủy' });

  } catch (error) {
    console.error('Lỗi hủy bài:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
// ✅ [5] Admin lấy tất cả đề ôn tập (group theo examCode)
router.get('/', authMiddleware(), async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';

    const { examCode } = req.query;

    if (examCode) {
      // 👩‍🎓 Học sinh truy cập bài cụ thể
      const questions = await PracticeQuestion.find({ examCode });

      if (questions.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
      }

      const safeQuestions = questions.map(q => ({
        _id: q._id,
        topic: q.topic,
        question: q.question,
        options: q.options
      }));

      return res.json({
        questions: safeQuestions,
        duration: questions[0]?.duration || 10,
        topic: questions[0]?.topic,
        examCode,
        totalQuestions: questions.length
      });
    }

    if (isAdmin) {
      // 👨‍💼 Admin không truyền examCode → lấy tất cả đề
      const allQuestions = await PracticeQuestion.find();

      // Nhóm theo examCode
      const grouped = {};
      allQuestions.forEach(q => {
        if (!grouped[q.examCode]) {
          grouped[q.examCode] = {
            examCode: q.examCode,
            topic: q.topic,
            duration: q.duration || 10,
            totalQuestions: 0,
            createdAt: q.createdAt
          };
        }
        grouped[q.examCode].totalQuestions += 1;
      });

      const list = Object.values(grouped).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.json({
        totalSets: list.length,
        exams: list
      });
    }

    return res.status(400).json({ message: 'Thiếu examCode hoặc không đủ quyền' });
  } catch (err) {
    console.error('❌ Lỗi lấy đề ôn tập:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


module.exports = router;
