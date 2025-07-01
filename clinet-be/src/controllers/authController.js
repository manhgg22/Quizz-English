const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/hash');
require('dotenv').config();


// ĐĂNG KÝ (chỉ user)
const register = async (req, res) => {
  const { email, password, role = 'user' } = req.body;

  try {
    if (role === 'admin') {
      return res.status(403).json({ msg: 'Không được đăng ký tài khoản admin từ đây' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Email đã tồn tại' });

    const hashedPassword = hashPassword(password);
    const newUser = await User.create({ email, password: hashedPassword, role });

    res.status(201).json({ msg: 'Tạo tài khoản thành công' });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
};

// ĐĂNG NHẬP
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Không tìm thấy tài khoản' });
    }

    const isMatch = comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Sai mật khẩu' });

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role || 'admin' // nếu Admin không có trường role
      },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role || 'admin'
      }
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
};
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString('hex'); // ví dụ: 'c1f2a3e4b5d6g7h8'
};

// 🧠 Đăng nhập Google
const googleLogin = async (req, res) => {
  const { email, fullName, avatar } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // nếu chưa tồn tại, tạo mới user
      const rawPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = hashPassword(rawPassword);

      user = await User.create({
        email,
        fullName,
        password: hashedPassword,
        avatar,
        role: 'user',
        status: 'active'
      });
    }

    // luôn trả về token và user
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    res.json({ token, user });

  } catch (err) {
    console.error('GOOGLE LOGIN ERROR:', err);
    res.status(500).json({ msg: 'Đăng nhập Google thất bại' });
  }
};




module.exports = {
  register,
  login,
  googleLogin
};
