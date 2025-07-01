require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callGemini(modelName, prompt) {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

async function explainMistake({ question, correct, selected }) {
  const prompt = `
Bạn là trợ lý AI giúp học sinh hiểu lý do vì sao các em làm sai câu hỏi.

Yêu cầu:
- Viết ngắn gọn, dễ hiểu, dành cho học sinh tiểu học.
- Trình bày kết quả dưới dạng JSON với 3 phần:
  {
    "why_wrong": "Giải thích vì sao đáp án của học sinh sai.",
    "how_to_fix": "Học sinh nên làm gì để tránh lỗi này.",
    "recommendation": "Lời khuyên nhẹ nhàng, tích cực, dễ hiểu."
  }

Câu hỏi: ${question}
Đáp án đúng: ${correct}
Học sinh đã chọn: ${selected}
`;

  try {
    return await callGemini("gemini-1.5-pro", prompt);
  } catch (err) {
    if (err.message.includes("429")) {
      
      return await callGemini("gemini-1.5-flash", prompt);
    }
    throw new Error("Không thể lấy phản hồi từ Gemini: " + err.message);
  }
}

module.exports = { explainMistake };
