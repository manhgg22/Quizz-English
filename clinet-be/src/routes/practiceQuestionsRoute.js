const express = require('express');
const router = express.Router();
const PracticeQuestion = require('../models/PracticeQuestion');
const PracticeResult = require('../models/PracticeResult'); // ✅ NEW
const authMiddleware = require('../middleware/authMiddleware');
const sendNotification = require('../utils/sendNotification');


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

    // ✅ Với bài luyện tập nhanh, lấy theo list _id
    let questions = [];

    if (examCode === 'quick-practice') {
      const questionIds = answers.map(a => a.questionId);
      questions = await PracticeQuestion.find({ _id: { $in: questionIds } });
    } else {
      questions = await PracticeQuestion.find({ examCode });
    }

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

    // ✅ Chỉ lưu kết quả nếu không phải luyện tập nhanh
    if (examCode !== 'quick-practice') {
      const result = await PracticeResult.create({
        userId,
        examCode,
        correct: correctCount,
        total,
        score: Number(score.toFixed(2))
      });

      // ✅ Gửi thông báo sau khi nộp bài thành công
      await sendNotification(
        userId,
        'Bạn đã hoàn thành bài luyện tập!',
        `Bạn đạt ${Number(score.toFixed(2))}/10 trong bài "${examCode}".`,
        'result',
        result._id.toString()
      );
    }


    res.json({
      message: 'Nộp bài thành công',
      correct: correctCount,
      total,
      score: Number(score.toFixed(2)),
      correctAnswers: questions.map(q => ({
        questionId: q._id.toString(),
        correctAnswer: q.correctAnswer
      }))
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

// ✅ [NEW] Học sinh lấy toàn bộ câu hỏi theo topic để luyện tập ngẫu nhiên
router.get('/by-topic', authMiddleware(), async (req, res) => {
  try {
    const { topic } = req.query;
    if (!topic) {
      return res.status(400).json({ message: 'Thiếu topic' });
    }

    const questions = await PracticeQuestion.find({ topic });

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Không có câu hỏi cho chủ đề này' });
    }

    const safeQuestions = questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      duration: q.duration || 10 // 👈 giữ duration nếu FE cần dùng
    }));

    const duration = questions[0]?.duration || 10;

    res.json({
      topic,
      duration, // ✅ thêm duration
      totalQuestions: safeQuestions.length,
      questions: safeQuestions
    });
  } catch (err) {
    console.error('Lỗi lấy câu hỏi theo topic:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ✅ [NEW] Lấy danh sách tất cả topic (dành cho dropdown luyện tập nhanh)
router.get('/topics', authMiddleware(), async (req, res) => {
  try {
    const topics = await PracticeQuestion.distinct('topic');
    res.json({ topics });
  } catch (err) {
    console.error('Lỗi lấy danh sách topic:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/practice-questions/topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await PracticeQuestion.distinct('topic');
    res.json({ topics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không thể lấy danh sách chủ đề.' });
  }
});
// DELETE /api/practice-questions/topics/:name
router.delete('/topics/:name', async (req, res) => {
  try {
    const topicName = decodeURIComponent(req.params.name);
    const result = await PracticeQuestion.deleteMany({ topic: topicName });
    res.json({ message: `Đã xoá ${result.deletedCount} câu hỏi trong chủ đề "${topicName}"` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Xoá chủ đề thất bại.' });
  }
});
// PUT /api/practice-questions/topics/:name
router.put('/topics/:name', async (req, res) => {
  try {
    const oldName = decodeURIComponent(req.params.name);
    const { newName } = req.body;

    const result = await PracticeQuestion.updateMany(
      { topic: oldName },
      { $set: { topic: newName } }
    );

    res.json({ message: `✅ Đã cập nhật ${result.modifiedCount} câu hỏi sang chủ đề "${newName}"` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Cập nhật chủ đề thất bại.' });
  }
});
router.get('/metadata', authMiddleware(true), async (req, res) => {
  try {
    const topics = await PracticeQuestion.distinct('topic');
    const examCodes = await PracticeQuestion.distinct('examCode');
    res.json({ topics, examCodes });
  } catch (err) {
    console.error('Lỗi lấy metadata:', err);
    res.status(500).json({ message: 'Không thể lấy metadata.' });
  }
});
// DELETE /api/practice-questions/combo-delete?topic=Toán&examCode=de123
router.delete('/combo-delete', authMiddleware(true), async (req, res) => {
  try {
    const { topic, examCode } = req.query;

    if (!topic || !examCode) {
      return res.status(400).json({ message: 'Thiếu topic hoặc examCode' });
    }

    const result = await PracticeQuestion.deleteMany({ topic, examCode });

    res.json({
      message: `✅ Đã xoá ${result.deletedCount} câu hỏi có topic "${topic}" và mã đề "${examCode}"`
    });
  } catch (err) {
    console.error('❌ Lỗi xoá theo topic & examCode:', err);
    res.status(500).json({ message: 'Xoá thất bại' });
  }
});
// GET /api/practice-questions/list/:examCode
router.get('/list/:examCode', authMiddleware(true), async (req, res) => {
  try {
    const examCode = req.params.examCode;
    const questions = await PracticeQuestion.find({ examCode }).sort({ createdAt: -1 });

    if (!questions.length) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi cho mã đề này' });
    }

    res.json({
      examCode,
      totalQuestions: questions.length,
      questions
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách câu hỏi theo mã đề:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
// GET /api/practice-questions/:id
router.get('/:id', authMiddleware(true), async (req, res) => {
  try {
    const question = await PracticeQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }
    res.json(question);
  } catch (err) {
    console.error('Lỗi lấy chi tiết câu hỏi:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
// PUT /api/practice-questions/:id
router.put('/:id', authMiddleware(true), async (req, res) => {
  try {
    const { question, topic, options, correctAnswer, duration } = req.body;

    if (!question || !correctAnswer || !Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }

    const updated = await PracticeQuestion.findByIdAndUpdate(
      req.params.id,
      { question, topic, options, correctAnswer, duration },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi để cập nhật' });
    }

    res.json({ message: '✅ Đã cập nhật câu hỏi', question: updated });
  } catch (err) {
    console.error('Lỗi cập nhật câu hỏi:', err);
    res.status(500).json({ message: 'Không thể cập nhật câu hỏi' });
  }
});
// DELETE /api/practice-questions/:id?examCode=de123
router.delete('/:id', authMiddleware(true), async (req, res) => {
  try {
    const { examCode } = req.query;
    const question = await PracticeQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }

    if (question.examCode !== examCode) {
      return res.status(403).json({ message: 'Không đúng mã đề, không được phép xoá' });
    }

    await PracticeQuestion.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Đã xoá câu hỏi thành công' });
  } catch (err) {
    console.error('Lỗi xoá câu hỏi:', err);
    res.status(500).json({ message: 'Không thể xoá câu hỏi' });
  }
});
// POST /api/practice-questions/add-one
router.post('/add-one', authMiddleware(true), async (req, res) => {
  try {
    const { topic, examCode, question, options, correctAnswer, duration } = req.body;

    if (!topic || !examCode || !question || !correctAnswer || !Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ message: 'Thiếu hoặc sai dữ liệu' });
    }

    const newQuestion = await PracticeQuestion.create({
      topic,
      examCode,
      question,
      options,
      correctAnswer,
      duration: duration || 10
    });

    res.status(201).json({
      message: '✅ Đã thêm câu hỏi mới',
      question: newQuestion
    });
  } catch (err) {
    console.error('Lỗi thêm câu hỏi:', err);
    res.status(500).json({ message: 'Không thể thêm câu hỏi' });
  }
});



module.exports = router;
