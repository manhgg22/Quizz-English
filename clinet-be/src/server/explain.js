// router.js - Version có debug chi tiết
const express = require('express');
const router = express.Router();
const { explainMistake } = require('./gemini');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



router.post('/', async (req, res) => {
  try {
    
    const mistakes = req.body.mistakes || req.body.questions || [];
    
 
    if (!mistakes || mistakes.length === 0) {
      return res.json({ 
        explanations: [], 
        debug: { 
          received: req.body,
          mistakesFound: false,
          mistakesLength: 0
        }
      });
    }
    
    const explanations = [];

    for (let i = 0; i < mistakes.length; i++) {
      const mistake = mistakes[i];
  
      
      // Kiểm tra cấu trúc của mistake
      if (!mistake.question || !mistake.correct || !mistake.selected) {

        continue;
      }
      
      try {
        const explanation = await explainMistake(mistake);
        explanations.push({
          question: mistake.question,
          explanation,
        });
    
      } catch (error) {
        console.error(`❌ Error processing mistake ${i + 1}:`, error.message);
        explanations.push({
          question: mistake.question,
          explanation: `Lỗi: ${error.message}`,
        });
      }
    }


    res.json({ explanations });
  } catch (err) {
    console.error('❌ Lỗi tổng quát:', err.message);
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: err.message,
      debug: {
        requestBody: req.body
      }
    });
  }
});
router.post('/chat', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) return res.status(400).json({ reply: 'Prompt không hợp lệ' });

  try {
    // Thử với gemini-1.5-pro
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const reply = await result.response.text();
    res.json({ reply });
  } catch (err) {
    console.warn('⚠️ Lỗi gemini-1.5-pro:', err.message);

    // Nếu lỗi là quota, fallback sang gemini-1.5-flash
    if (err.message.includes('quota') || err.message.includes('429')) {
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const fallbackResult = await fallbackModel.generateContent(prompt);
        const fallbackReply = await fallbackResult.response.text();
        return res.json({ reply: fallbackReply + '\n\n()' });
      } catch (fallbackErr) {
        console.error('❌ Lỗi fallback flash:', fallbackErr.message);
        return res.status(500).json({ reply: 'Cả 2 model đều lỗi: ' + fallbackErr.message });
      }
    }

    res.status(500).json({ reply: 'Lỗi khi gọi Gemini: ' + err.message });
  }
});



module.exports = router;