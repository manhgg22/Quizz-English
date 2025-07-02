const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/hash');
require('dotenv').config();
const sendEmail = require('../utils/mail');  



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
        role: user.role || 'admin',
         fullName: user.fullName, 
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
const codeMap = new Map(); // { email: { code, expires } }

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'Email không tồn tại trong hệ thống' });

    const code = generateCode();
    const expires = Date.now() + 5 * 60 * 1000; // 5 phút

    // Lưu vào user trong DB
   user.resetCode = code;
user.resetCodeExpires = expires;
await user.save();


    await sendEmail(
      email,
      'Mã xác thực khôi phục mật khẩu',
      `<h2>Mã xác nhận của bạn là: <span style="color:blue">${code}</span></h2><p>Mã có hiệu lực trong 5 phút.</p>`
    );

    res.json({ msg: 'Đã gửi mã xác thực đến email của bạn' });
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
};


const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  const stored = codeMap.get(email);
  if (!stored) return res.status(400).json({ msg: 'Không có yêu cầu khôi phục cho email này' });

  if (stored.expires < Date.now()) {
    codeMap.delete(email);
    return res.status(400).json({ msg: 'Mã xác thực đã hết hạn' });
  }

  if (stored.code !== code) {
    return res.status(400).json({ msg: 'Mã xác thực không đúng' });
  }

  // Sau khi xác nhận đúng mã, bạn có thể cho phép đổi mật khẩu
  codeMap.delete(email); // hoặc giữ tạm
  res.json({ msg: 'Xác thực thành công' });
};
 const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.resetCode !== token || Date.now() > user.resetCodeExpires) {
      return res.status(400).json({ msg: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
    }

    user.password = hashPassword(newPassword);
    user.resetCode = null;
    user.resetCodeExpires = null;

    await user.save();

    res.json({ msg: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err);
    res.status(500).json({ msg: 'Lỗi server khi đặt lại mật khẩu' });
  }
};





module.exports = {
  register,
  login,
  googleLogin,
   forgotPassword,
  verifyCode,
   resetPassword 
};
