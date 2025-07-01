const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { register, login, googleLogin } = require('../controllers/authController');
const passport = require('passport');
const jwt = require('jsonwebtoken');


// Đăng ký
router.post('/register', register);

// Đăng nhập
router.post('/login', login);
router.post('/google-login', googleLogin); // m

// Profile dành cho tất cả user
router.get('/profile', authMiddleware(), (req, res) => {
  res.json({ msg: 'Welcome to your profile', user: req.user });
});

// Dashboard dành riêng cho admin
router.get('/admin/dashboard', authMiddleware(true), (req, res) => {
  res.json({ msg: 'Welcome admin', user: req.user });
});
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));
// Callback Google
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user;

    // Lấy thông tin từ user object
    const email = user.email;
    const name = encodeURIComponent(user.fullName || user.name); // tuỳ theo bạn lưu là fullName
    const avatar = encodeURIComponent(user.avatar || '');

    // Redirect về GoogleCallback frontend kèm query
    res.redirect(`${process.env.FRONTEND_URL}/google-callback?email=${email}&name=${name}&avatar=${avatar}`);
  }
);



module.exports = router;
