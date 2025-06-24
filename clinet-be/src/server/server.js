const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/authRoutes');
const questionRoutes  = require('../routes/questions')
const cors = require('cors')
require('dotenv').config();
// Tạo server
const server = express();
server.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Ket noi den DB

server.use(express.json());
server.use('/api/auth', authRoutes);
server.use('/api/questions', questionRoutes);

mongoose.connect(process.env.MONGO_URI)

.then(() => {
    console.log('MongoDB connected');
    server.listen(9999, () => console.log('Server running on port 9999'));
})
.catch(err => console.error('DB error:', err));
const PORT = 9999 || process.env.PORT;
const HOSTNAME = process.env.HOSTNAME;
server.listen(PORT, HOSTNAME, () => {
    console.log(`Server is running at http://${HOSTNAME}:${PORT}`);
});