const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/questions
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { questionText, options, correctAnswer, examId } = req.body;

    if (!questionText || !options || !correctAnswer || !examId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const newQuestion = new Question({ questionText, options, correctAnswer, examId });
    const savedQuestion = await newQuestion.save();

    res.status(201).json(savedQuestion);
  } catch (err) {
    res.status(500).json({ message: 'Error creating question', error: err });
  }
});

module.exports = router;
