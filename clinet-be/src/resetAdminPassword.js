const mongoose = require('mongoose');
const crypto = require('crypto');

// Hàm hash password bằng SHA256
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Định nghĩa schema Admin đơn giản đủ dùng
const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const Admin = mongoose.model('Admin', adminSchema, 'admins'); // 👈 chỉ định rõ collection 'admins'

async function updatePassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Quizzz_English');

    const hashed = hashPassword('admin123');
    const result = await Admin.updateOne(
      { email: 'admin@example.com' },
      { $set: { password: hashed } }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Password reset thành công cho admin@example.com trong collection admins');
    } else {
      console.log('⚠️ Không tìm thấy admin@example.com trong collection admins');
    }
  } catch (err) {
    console.error('❌ Lỗi cập nhật mật khẩu:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

updatePassword();
