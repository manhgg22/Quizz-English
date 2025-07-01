require('dotenv').config();

async function explainMistake(questionObj) {
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

  const prompt = `
Bạn là trợ lý AI. Hãy giải thích tại sao người dùng chọn sai đáp án.

Câu hỏi: ${questionObj.question}
Đáp án đúng: ${questionObj.correct}
Người dùng chọn: ${questionObj.selected}

Giải thích chi tiết:
`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`[${res.status}] ${data.error?.message || 'Unknown error'}`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "(Không có giải thích)";
  } catch (err) {
    console.error("❌ Lỗi gọi Gemini:", err.message);
    throw new Error("Không thể lấy giải thích từ Gemini");
  }
}

module.exports = { explainMistake };
