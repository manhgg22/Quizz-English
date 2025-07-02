const express = require('express');
const router = express.Router();
const PracticeResult = require('../models/PracticeResult');
const authMiddleware = require('../middleware/authMiddleware');
const ExcelJS = require('exceljs'); // npm install exceljs
const sendNotification = require('../utils/sendNotification');


// Lấy lịch sử làm bài với filter
router.get('/', authMiddleware(), async (req, res) => {
  try {
    const { examCode, userId } = req.query;
    let query = {};
    let results;

    if (req.user.role === 'admin') {
      if (examCode) query.examCode = examCode;
      if (userId) query.userId = userId;
      results = await PracticeResult.find(query)
        .populate('userId', 'fullName email') // ✅ populate fullName & email
        .sort({ submittedAt: -1 });
    } else {
      query.userId = req.user.id;
      if (examCode) query.examCode = examCode;
      results = await PracticeResult.find(query)
        .populate('userId', 'fullName email') // ✅ populate cho học sinh luôn
        .sort({ submittedAt: -1 });
    }

    res.json(results);
  } catch (err) {
    console.error('❌ Lỗi khi lấy lịch sử làm bài:', err);
    res.status(500).json({ message: 'Không thể lấy kết quả' });
  }
});

// API xuất Excel
router.get('/export-excel', authMiddleware(), async (req, res) => {
  try {
    const { examCode, userId } = req.query;
    let query = {};
    let results;

    if (req.user.role === 'admin') {
      if (examCode) query.examCode = examCode;
      if (userId) query.userId = userId;
      results = await PracticeResult.find(query)
        .populate('userId', 'fullName email')
        .sort({ submittedAt: -1 });
    } else {
      query.userId = req.user.id;
      if (examCode) query.examCode = examCode;
      results = await PracticeResult.find(query)
        .populate('userId', 'fullName email')
        .sort({ submittedAt: -1 });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Kết quả làm bài');

    // ✅ Header chính xác
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 10 },
      { header: 'Mã đề thi', key: 'examCode', width: 15 },
      { header: 'Họ và tên', key: 'fullName', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Số câu đúng', key: 'correct', width: 15 },
      { header: 'Tổng số câu', key: 'total', width: 15 },
      { header: 'Điểm', key: 'score', width: 10 },
      { header: 'Thời gian nộp', key: 'submittedAt', width: 20 }
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // ✅ Ghi đúng `fullName`
    results.forEach((result, index) => {
      worksheet.addRow({
        stt: index + 1,
        examCode: result.examCode,
        fullName: result.userId?.fullName || 'N/A', // ✅ key chính xác
        email: result.userId?.email || 'N/A',
        correct: result.correct,
        total: result.total,
        score: `${result.score}/10`,
        submittedAt: new Date(result.submittedAt).toLocaleString('vi-VN')
      });
    });

    for (let i = 2; i <= results.length + 1; i++) {
      worksheet.getRow(i).eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }

    const fileName = `ket-qua-lam-bai-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('❌ Lỗi khi xuất Excel:', err);
    res.status(500).json({ message: 'Không thể xuất file Excel' });
  }
});

// API lấy danh sách examCode để filter dropdown
router.get('/exam-codes', authMiddleware(), async (req, res) => {
  try {
    let examCodes;

    if (req.user.role === 'admin') {
      examCodes = await PracticeResult.distinct('examCode');
    } else {
      examCodes = await PracticeResult.distinct('examCode', { userId: req.user.id });
    }

    res.json(examCodes);
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách examCode:', err);
    res.status(500).json({ message: 'Không thể lấy danh sách mã đề thi' });
  }
});

// API lấy danh sách user (chỉ admin)
router.get('/users', authMiddleware(), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
    }

    const User = require('../models/User');
    const users = await User.find(
      { role: { $ne: 'admin' } },
      'fullName email'
    ).sort({ fullName: 1 }); // ✅ sort đúng theo fullName

    res.json(users);
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách user:', err);
    res.status(500).json({ message: 'Không thể lấy danh sách người dùng' });
  }
});

module.exports = router;
