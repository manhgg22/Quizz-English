// routes/practiceStartRoute.js
const express = require('express');
const router = express.Router();
const PracticeQuestion = require('../models/PracticeQuestion');
const Class = require('../models/Classes');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/start', authMiddleware(true), async (req, res) => {
  try {
    const { examCode } = req.body;
    const userId = req.user.id;

    const foundClass = await Class.findOne({ code: examCode });

    if (!foundClass) {
      return res.status(404).json({ message: 'Không tìm thấy lớp học từ mã code' });
    }

    if (!foundClass.students.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không thuộc lớp học này' });
    }


    res.json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không thể bắt đầu ôn tập' });
  }
});

module.exports = router;
