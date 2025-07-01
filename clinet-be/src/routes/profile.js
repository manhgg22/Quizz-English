// routes/profile.js
const express = require('express');const crypto = require('crypto');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { auth} = require('../middleware/authMiddleware'); 
const User = require('../models/User'); 
const router = express.Router();

// Cấu hình multer cho upload avatar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
    }
  }
});

// Validation rules
const profileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ và tên phải có từ 2-100 ký tự'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Giới tính không hợp lệ'),
  
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Ngày sinh không hợp lệ')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      if (birthDate >= today) {
        throw new Error('Ngày sinh phải nhỏ hơn ngày hiện tại');
      }
      return true;
    })
];

const passwordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Vui lòng nhập mật khẩu hiện tại'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Mật khẩu mới phải có ít nhất 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số')
];

// GET /api/users/:id - Lấy thông tin profile
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Kiểm tra quyền truy cập (chỉ user hoặc admin mới được xem)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập thông tin này'
      });
    }

    // Tìm user trong database (giả sử bạn dùng MongoDB/Mongoose)
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin profile'
    });
  }
});

// PUT /api/users/:id - Cập nhật profile
router.put('/:id', auth, profileValidation, async (req, res) => {
  try {
    // Kiểm tra validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const userId = req.params.id;
    const updateData = req.body;

    // Kiểm tra quyền truy cập
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật thông tin này'
      });
    }

    // Kiểm tra email unique nếu có thay đổi
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng bởi tài khoản khác'
        });
      }
    }

    // Cập nhật thông tin
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...updateData,
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật profile'
    });
  }
});

// POST /api/users/:id/avatar - Upload avatar
router.post('/:id/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.params.id;

    // Kiểm tra quyền truy cập
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật ảnh đại diện này'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh'
      });
    }

    // Tìm user và xóa avatar cũ nếu có
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Xóa file avatar cũ
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar.replace('/api/', ''));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Cập nhật đường dẫn avatar mới
    const avatarUrl = `/api/uploads/avatars/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        avatar: avatarUrl,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Upload ảnh đại diện thành công',
      data: {
        avatarUrl: avatarUrl,
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload ảnh đại diện'
    });
  }
});

// POST /api/users/:id/change-password - Đổi mật khẩu

router.post('/:id/change-password', auth, passwordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    // Kiểm tra quyền
    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'Không có quyền thay đổi mật khẩu' });
    }

    // Tìm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // So sánh mật khẩu hiện tại đã mã hóa
    const hashedCurrent = crypto.createHash('sha256').update(currentPassword).digest('hex');
    if (user.password !== hashedCurrent) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
    }

    // Kiểm tra mật khẩu mới khác mật khẩu cũ
    const hashedNew = crypto.createHash('sha256').update(newPassword).digest('hex');
    if (user.password === hashedNew) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải khác mật khẩu hiện tại' });
    }

    // Cập nhật mật khẩu
    await User.findByIdAndUpdate(userId, {
      password: hashedNew,
      updatedAt: new Date()
    });

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi đổi mật khẩu' });
  }
});


// GET /api/users/:id/stats - Lấy thống kê người dùng
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Kiểm tra quyền truy cập
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập thông tin này'
      });
    }

    // Tính toán thống kê (giả sử bạn có các model Test, Result, Class)
    const stats = {
      totalTests: 0,
      completedTests: 0,
      averageScore: 0,
      totalClasses: 0,
      pendingResults: 0
    };

    // Ví dụ query (thay thế bằng logic thực tế của bạn)
    /*
    const Test = require('../models/Test');
    const Result = require('../models/Result');
    const Class = require('../models/Class');

    const [totalTests, completedTests, results, classes] = await Promise.all([
      Test.countDocuments({ createdBy: userId }),
      Result.countDocuments({ userId: userId, status: 'completed' }),
      Result.find({ userId: userId, score: { $exists: true } }),
      Class.countDocuments({ students: userId })
    ]);

    const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
    const averageScore = results.length > 0 ? totalScore / results.length : 0;
    const pendingResults = await Result.countDocuments({ userId: userId, status: 'pending' });

    stats.totalTests = totalTests;
    stats.completedTests = completedTests;
    stats.averageScore = Math.round(averageScore * 10) / 10;
    stats.totalClasses = classes;
    stats.pendingResults = pendingResults;
    */

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê'
    });
  }
});

// GET /api/users/:id/notifications - Lấy thông báo người dùng
router.get('/:id/notifications', auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Kiểm tra quyền truy cập
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập thông tin này'
      });
    }

    // Lấy thông báo (giả sử bạn có model Notification)
    const notifications = [];
    
    /*
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(20);
    */

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông báo'
    });
  }
});

// DELETE /api/users/:id - Xóa tài khoản
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Kiểm tra quyền truy cập (chỉ chính user hoặc admin)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa tài khoản này'
      });
    }

    // Tìm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Xóa avatar nếu có
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '..', user.avatar.replace('/api/', ''));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Xóa user
    await User.findByIdAndDelete(userId);

    // Xóa các dữ liệu liên quan (nếu cần)
    /*
    await Promise.all([
      Test.deleteMany({ createdBy: userId }),
      Result.deleteMany({ userId: userId }),
      Notification.deleteMany({ userId: userId })
    ]);
    */

    res.json({
      success: true,
      message: 'Xóa tài khoản thành công'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa tài khoản'
    });
  }
});

// Middleware xử lý lỗi upload
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Kích thước tối đa là 2MB'
      });
    }
  }
  
  if (error.message === 'Chỉ chấp nhận file hình ảnh!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

module.exports = router;