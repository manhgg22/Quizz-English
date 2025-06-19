const crypto = require('crypto');

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const comparePassword = (inputPassword, hashedPassword) => {
  const inputHashed = hashPassword(inputPassword);
  return inputHashed === hashedPassword;
};

module.exports = {
  hashPassword,
  comparePassword
};
