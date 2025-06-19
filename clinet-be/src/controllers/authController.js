const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/hash');
require('dotenv').config();

// ✅ ĐĂNG KÝ NGƯỜI DÙNG - Chỉ cho phép role = 'user'
const register = async (req, res) => {
  const { email, password, role = 'user' } = req.body;

  try {
    // ❌ Không cho phép tạo tài khoản role admin từ đây
    if (role === 'admin') {
      return res.status(403).json({ msg: 'Cannot register as admin' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Email already exists' });

    const hashedPassword = hashPassword(password);
    const newUser = await User.create({ email, password: hashedPassword, role });

    res.status(201).json({ msg: 'User created' });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ✅ ĐĂNG NHẬP - kiểm tra cả users và admins
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    

    // 🔍 Tìm trong users trước
    let user = await User.findOne({ email });


    if (!user) {
      // ❌ Không tìm thấy trong users → tìm trong admins
      user = await Admin.findOne({ email });

      if (!user) return res.status(400).json({ msg: 'User not found' });
    }

    const isMatch = comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Wrong password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role || 'admin' // fallback nếu trong Admin không có field role
      }
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// EXPORT
module.exports = {
  register,
  login
};
