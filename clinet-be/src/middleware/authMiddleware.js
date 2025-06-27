const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (requireAdmin = false) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Middleware decoded token:', decoded); // 👉 THÊM DÒNG NÀY

      // Kiểm tra payload có userId không
      if (!decoded.userId) {
        return res.status(401).json({ msg: 'Invalid token payload' });
      }

      // Nếu yêu cầu là admin mà không phải admin → từ chối
      if (requireAdmin && decoded.role !== 'admin') {
        return res.status(403).json({ msg: 'Admins only' });
      }

      // Lưu thông tin người dùng vào request
      req.user = {
        id: decoded.userId,
        role: decoded.role
      };

      next();
    } catch (err) {
      console.error('AUTH ERROR:', err);
      return res.status(401).json({ msg: 'Invalid token' });
    }
  };
};
