const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  fullName: {
    type: String
  },
  phone: {
    type: String
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  dob: {
    type: Date
  },
  classes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'  // bạn sẽ tạo collection Class tương ứng
    }
  ]
}, {
  timestamps: true  // tự tạo createdAt, updatedAt
});

module.exports = mongoose.model('User', userSchema);
