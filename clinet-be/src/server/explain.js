const express = require('express');
const router = express.Router();
const { explainMistake } = require('./gemini');

router.post('/', async (req, res) => {
  try {
    const questions = req.body.questions || [];
    const explanations = [];

    for (const q of questions) {
      const explanation = await explainMistake(q);
      explanations.push({
        question: q.question,
        explanation,
      });
    }

    res.json({ explanations });
  } catch (err) {
    console.error('❌ Lỗi gọi Gemini API:', err.message);
    res.status(500).json({ message: 'Lỗi gọi Gemini API', error: err.message });
  }
});

module.exports = router;
