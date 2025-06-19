const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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
    default: 'admin'
  },
  position: {
    type: String,
    default: 'Administrator'
  },
  permissions: {
    type: [String],
    default: ['manage_users', 'manage_tests', 'view_results']
  },
  note: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
