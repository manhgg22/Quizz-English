const express = require('express');
const router = express.Router();
const Class = require('../models/Classes');
const generateUniqueCode = require('../utils/generateCode');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Tạo lớp học mới (chỉ admin)
router.post('/', authMiddleware(true), async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user._id;


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

// ✅ Lấy danh sách lớp học của admin
router.get('/', authMiddleware(true), async (req, res) => {
    try {
        const userId = req.user._id;


        const classes = await Class.find({ createdBy: userId }).sort({ createdAt: -1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: 'Không thể tải danh sách lớp học' });
    }
});

module.exports = router;
