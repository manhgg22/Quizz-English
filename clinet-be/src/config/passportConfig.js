const crypto = require('crypto');
const { hashPassword } = require('../utils/hash');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const fullName = profile.displayName || 'Google User';
    const avatar = profile.photos?.[0]?.value;

    if (!email) return done(new Error('Không lấy được email từ Google'), null);

    // ✅ Tìm theo email trước để tránh lỗi trùng
    let user = await User.findOne({ email });

    if (!user) {
      // ➕ Tạo mới user nếu chưa có
      const rawPassword = generateRandomPassword();
      const hashedPassword = hashPassword(rawPassword);

      user = await User.create({
        googleId: profile.id,
        email,
        fullName,
        password: hashedPassword,
        avatar,
        role: 'user',
        status: 'active'
      });
    } else {
      // ⚠ Nếu user đã có nhưng chưa có googleId → gán thêm
      let updated = false;

      if (!user.googleId) {
        user.googleId = profile.id;
        updated = true;
      }

      if (!user.fullName && fullName) {
        user.fullName = fullName;
        updated = true;
      }

      if (updated) {
        await user.save();
      }
    }

    return done(null, user);

  } catch (err) {
    console.error('GOOGLE STRATEGY ERROR:', err);
    return done(err, null);
  }
}));
