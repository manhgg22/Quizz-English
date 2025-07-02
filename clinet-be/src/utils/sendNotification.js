// utils/sendNotification.js
const Notification = require('../models/Notification');

/**
 * Gửi thông báo đến một người dùng
 * @param {string} userId - ID của người nhận thông báo
 * @param {string} title - Tiêu đề thông báo
 * @param {string} message - Nội dung mô tả
 * @param {'system' | 'exam' | 'result'} type - Loại thông báo
 * @param {string} [linkId] - ID liên kết đến hành động (examId, resultId, classId,...)
 */
const sendNotification = async (userId, title, message, type = 'system', linkId = null) => {
  try {
    if (!userId || !title) return;

    await Notification.create({
      userId,
      title,
      message,
      type,
      linkId,
      read: false,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('❌ Lỗi khi gửi thông báo:', error.message);
  }
};

module.exports = sendNotification;
