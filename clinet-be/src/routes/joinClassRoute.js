const express = require('express');
const router = express.Router();
const Class = require('../models/Classes');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/join-class
router.post('/', authMiddleware(false), async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    const classDoc = await Class.findOne({ code });
    if (!classDoc) return res.status(404).json({ message: 'Mã lớp không tồn tại' });

    if (classDoc.students.includes(userId)) {
      return res.status(400).json({ message: 'Bạn đã tham gia lớp này rồi' });
    }

    classDoc.students.push(userId);
    await classDoc.save();

    res.json({ message: 'Tham gia lớp thành công', class: classDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi tham gia lớp' });
  }
});

module.exports = router;
