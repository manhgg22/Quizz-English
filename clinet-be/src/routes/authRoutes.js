const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { register, login } = require('../controllers/authController');

// Đăng ký
router.post('/register', register);

// Đăng nhập
router.post('/login', login);

// Profile dành cho tất cả user
router.get('/profile', authMiddleware(), (req, res) => {
  res.json({ msg: 'Welcome to your profile', user: req.user });
});

// Dashboard dành riêng cho admin
router.get('/admin/dashboard', authMiddleware(true), (req, res) => {
  res.json({ msg: 'Welcome admin', user: req.user });
});

module.exports = router;
