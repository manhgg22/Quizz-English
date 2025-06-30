const express = require('express');
const router = express.Router(); // <- Dòng khai báo router
const PracticeResult = require('../models/PracticeResult');
const authMiddleware = require('../middleware/authMiddleware');

// Lấy lịch sử làm bài
router.get('/', authMiddleware(), async (req, res) => {
  try {
    let results;

    // Phân quyền: nếu là admin thì lấy tất cả
    if (req.user.role === 'admin') {
      results = await PracticeResult.find().sort({ submittedAt: -1 });
    } else {
      // Nếu là học sinh thì chỉ lấy bài của chính họ
      const userId = req.user.id;
      results = await PracticeResult.find({ userId }).sort({ submittedAt: -1 });
    }

    res.json(results);
  } catch (err) {
    console.error('❌ Lỗi khi lấy lịch sử làm bài:', err);
    res.status(500).json({ message: 'Không thể lấy kết quả' });
  }
});

module.exports = router;
