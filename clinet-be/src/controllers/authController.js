const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { hashPassword } = require('../utils/hash');

exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ msg: 'Email already exists' });

        const hashedPassword = hashPassword(password);
        const newUser = await User.create({ email, password: hashedPassword });

        res.status(201).json({ msg: 'User created' });
    } catch (err) {
        console.error('REGISTER ERROR:', err); // 👈 THÊM DÒNG NÀY
        res.status(500).json({ msg: 'Server error' });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const hashed = hashPassword(password);
        if (hashed !== user.password) return res.status(400).json({ msg: 'Wrong password' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
