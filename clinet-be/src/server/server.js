const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/authRoutes');
const questionRoutes  = require('../routes/questions')
const adminRoutes = require('../routes/AdminCreateClass');
const joinClassRoute = require('../routes/joinClassRoute');
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
server.use('/api/classes', adminRoutes);
server.use('/api/join-class', joinClassRoute); 

mongoose.connect(process.env.MONGO_URI)

.then(() => {
    console.log('MongoDB connected');

})
.catch(err => console.error('DB error:', err));
const PORT = 9999 || process.env.PORT;
const HOSTNAME = process.env.HOSTNAME;
server.listen(PORT, HOSTNAME, () => {
    console.log(`Server is running at http://${HOSTNAME}:${PORT}`);
});
