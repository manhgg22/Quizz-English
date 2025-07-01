// router.js - Version có debug chi tiết
const express = require('express');
const router = express.Router();
const { explainMistake } = require('./gemini');

router.post('/', async (req, res) => {
  try {
    // Debug: In ra toàn bộ request body
    console.log('🔍 FULL REQUEST BODY:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Request body type:', typeof req.body);
    console.log('🔍 Request body keys:', Object.keys(req.body));
    
    // Sửa: Nhận cả questions và mistakes
    const mistakes = req.body.mistakes || req.body.questions || [];
    console.log('📋 Mistakes array:', mistakes);
    console.log('📋 Mistakes length:', mistakes.length);
    console.log('📋 Mistakes type:', typeof mistakes);
    
    // Kiểm tra nếu mistakes rỗng
    if (!mistakes || mistakes.length === 0) {
      console.log('⚠️ No mistakes found in request');
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
      console.log(`🔍 Processing mistake ${i + 1}:`, mistake);
      
      // Kiểm tra cấu trúc của mistake
      if (!mistake.question || !mistake.correct || !mistake.selected) {
        console.log('⚠️ Invalid mistake structure:', mistake);
        continue;
      }
      
      try {
        const explanation = await explainMistake(mistake);
        explanations.push({
          question: mistake.question,
          explanation,
        });
        console.log(`✅ Added explanation ${i + 1}`);
      } catch (error) {
        console.error(`❌ Error processing mistake ${i + 1}:`, error.message);
        explanations.push({
          question: mistake.question,
          explanation: `Lỗi: ${error.message}`,
        });
      }
    }

    console.log('✅ Final explanations count:', explanations.length);
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const reply = await result.response.text();
    res.json({ reply });
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    res.status(500).json({ reply: 'Lỗi khi gọi Gemini: ' + err.message });
  }
});


module.exports = router;