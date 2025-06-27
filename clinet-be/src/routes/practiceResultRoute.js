const express = require('express');
const router = express.Router();
const PracticeResult = require('../models/PracticeResult');
const authMiddleware = require('../middleware/authMiddleware');

// Lấy lịch sử làm bài của học sinh
router.get('/', authMiddleware(), async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await PracticeResult.find({ userId }).sort({ submittedAt: -1 });

    res.json(results);
  } catch (err) {
    console.error('Lỗi khi lấy lịch sử làm bài:', err);
    res.status(500).json({ message: 'Không thể lấy kết quả' });
  }
});

module.exports = router;
