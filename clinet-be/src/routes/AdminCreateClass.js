const express = require('express');
const router = express.Router();
const Class = require('../models/Classes');
const generateUniqueCode = require('../utils/generateCode');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware(), async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    const code = await generateUniqueCode();

    const newClass = await Class.create({
      name,
      code,
      createdBy: userId,
    });

    res.status(201).json(newClass);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi tạo lớp học' });
  }
});


router.get('/', authMiddleware(), async (req, res) => {
  try {
    const userId = req.user.id;

    const classes = await Class.find({ createdBy: userId })
      .populate('students', 'email')
      .sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Không thể tải danh sách lớp học' });
  }
});

router.put('/:id', authMiddleware(true), async (req, res) => {
  const { name } = req.body;
  const updated = await Class.findByIdAndUpdate(req.params.id, { name }, { new: true });
  res.json(updated);
});

router.delete('/:id', authMiddleware(true), async (req, res) => {
  const classToDelete = await Class.findById(req.params.id);
  if (classToDelete.students.length > 0) {
    return res.status(400).json({ message: 'Không thể xoá lớp có học sinh' });
  }
  await Class.findByIdAndDelete(req.params.id);
  res.json({ message: 'Xoá lớp thành công' });
});

router.post('/:id/notify', authMiddleware(true), async (req, res) => {
  const { message } = req.body;

  console.log('Gửi thông báo tới lớp', req.params.id, message);
  res.json({ msg: 'Đã gửi thông báo (demo)' });
});

router.post('/:id/assign-test', authMiddleware(true), async (req, res) => {
  const { testId } = req.body;
  await Class.findByIdAndUpdate(req.params.id, { $addToSet: { assignedTests: testId } });
  res.json({ msg: 'Đã gán bài thi' });
});

router.get('/:id/results', authMiddleware(true), async (req, res) => {
  const classData = await Class.findById(req.params.id).populate('students');
  const results = await Result.find({ user: { $in: classData.students } }).populate('test');
  res.json(results);
});





module.exports = router;
