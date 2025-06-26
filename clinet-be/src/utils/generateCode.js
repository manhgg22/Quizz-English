const Class = require('../models/Classes');

async function generateUniqueCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = [...Array(length)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (await Class.findOne({ code }));
  return code;
}

module.exports = generateUniqueCode;
