const express = require('express');
const router = express.Router();
const PracticeResult = require('../models/PracticeResult');
const authMiddleware = require('../middleware/authMiddleware');
const ExcelJS = require('exceljs'); // npm install exceljs

// Lấy lịch sử làm bài với filter
router.get('/', authMiddleware(), async (req, res) => {
  try {
    const { examCode, userId } = req.query;
    let query = {};
    let results;

    // Phân quyền: nếu là admin thì lấy tất cả
    if (req.user.role === 'admin') {
      // Admin có thể lọc theo examCode và userId
      if (examCode) {
        query.examCode = examCode;
      }
      if (userId) {
        query.userId = userId;
      }
      results = await PracticeResult.find(query).sort({ submittedAt: -1 });
    } else {
      // Nếu là học sinh thì chỉ lấy bài của chính họ
      query.userId = req.user.id;
      // Học sinh có thể lọc theo examCode của chính họ
      if (examCode) {
        query.examCode = examCode;
      }
      results = await PracticeResult.find(query).sort({ submittedAt: -1 });
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

    // Phân quyền tương tự như API lấy dữ liệu
    if (req.user.role === 'admin') {
      if (examCode) query.examCode = examCode;
      if (userId) query.userId = userId;
      results = await PracticeResult.find(query).populate('userId', 'username email').sort({ submittedAt: -1 });
    } else {
      query.userId = req.user.id;
      if (examCode) query.examCode = examCode;
      results = await PracticeResult.find(query).populate('userId', 'username email').sort({ submittedAt: -1 });
    }

    // Tạo workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Kết quả làm bài');

    // Định nghĩa header
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 10 },
      { header: 'Mã đề thi', key: 'examCode', width: 15 },
      { header: 'Tên học sinh', key: 'username', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Số câu đúng', key: 'correct', width: 15 },
      { header: 'Tổng số câu', key: 'total', width: 15 },
      { header: 'Điểm', key: 'score', width: 10 },
      { header: 'Thời gian nộp', key: 'submittedAt', width: 20 }
    ];

    // Style cho header
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

    // Thêm dữ liệu
    results.forEach((result, index) => {
      worksheet.addRow({
        stt: index + 1,
        examCode: result.examCode,
        username: result.userId?.username || 'N/A',
        email: result.userId?.email || 'N/A',
        correct: result.correct,
        total: result.total,
        score: `${result.score}/10`,
        submittedAt: new Date(result.submittedAt).toLocaleString('vi-VN')
      });
    });

    // Style cho các cell dữ liệu
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

    // Tạo tên file
    const fileName = `ket-qua-lam-bai-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Ghi file và gửi response
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('❌ Lỗi khi xuất Excel:', err);
    res.status(500).json({ message: 'Không thể xuất file Excel' });
  }
});

// API lấy danh sách examCode để làm filter dropdown
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

    const User = require('../models/User'); // Giả sử có model User
    const users = await User.find({ role: { $ne: 'admin' } }, 'username email').sort({ username: 1 });
    
    res.json(users);
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách user:', err);
    res.status(500).json({ message: 'Không thể lấy danh sách người dùng' });
  }
});

module.exports = router;