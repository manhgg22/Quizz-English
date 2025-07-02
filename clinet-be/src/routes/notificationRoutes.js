const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddleware').auth;

// 📥 GET: lấy tất cả thông báo của user → /api/notifications/:userId
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const notifs = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.json({ success: true, data: notifs });
  } catch (err) {
    console.error('❌ Lỗi get notifications:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ✅ PUT: đánh dấu tất cả đã đọc → /api/notifications/:userId/mark-all-read
router.put('/:userId/mark-all-read', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền' });
    }

    await Notification.updateMany({ userId, read: false }, { read: true });
    res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ✅ PUT: đánh dấu 1 thông báo đã đọc → /api/notifications/:id/mark-read
router.put('/:id/mark-read', auth, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif || (notif.userId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Không có quyền' });
    }

    notif.read = true;
    await notif.save();

    res.json({ success: true, message: 'Đã đánh dấu là đã đọc' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ➕ POST: tạo thông báo mới → /api/notifications
router.post('/', auth, async (req, res) => {
  try {
    const { userId, title, message, type, linkId } = req.body;

    const newNotif = await Notification.create({
      userId,
      title,
      message,
      type,
      linkId,
      read: false
    });

    res.status(201).json({ success: true, data: newNotif });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Không thể tạo thông báo' });
  }
});

// 🗑 DELETE: xoá thông báo → /api/notifications/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif || (notif.userId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Không có quyền' });
    }

    await Notification.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Đã xoá thông báo' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
