require('dotenv').config(); // Đảm bảo biến môi trường được load ở đây

const crypto = require('crypto');

const SALT = process.env.SALT;

if (!SALT) {
  throw new Error('SALT is undefined. Please check your .env file.');
}

const hashPassword = (password) => {
  return crypto.createHmac('sha256', SALT).update(password).digest('hex');
};

module.exports = { hashPassword };
