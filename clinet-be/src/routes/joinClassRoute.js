const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Class = require('../models/Classes');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware(), async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    const foundClass = await Class.findOne({ code });
    if (!foundClass) return res.status(404).json({ message: 'Không tìm thấy lớp học' });

    if (foundClass.students.includes(userId)) {
      return res.status(400).json({ message: 'Bạn đã tham gia lớp này rồi' });
    }

    // ✅ ép userId về ObjectId
    foundClass.students.push(new mongoose.Types.ObjectId(userId));
    await foundClass.save();

    res.json({ message: 'Tham gia lớp thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
router.get('/', authMiddleware(), async (req, res) => {
  try {
    const userId = req.user.id;

    const joinedClasses = await Class.find({ students: userId }).select('name code');

    res.json(joinedClasses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách lớp' });
  }
});

module.exports = router;
