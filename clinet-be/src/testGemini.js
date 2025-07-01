require('dotenv').config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;

const url = `https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=${apiKey}`;


  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: "1 + 1 bằng mấy?" }]
      }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Lỗi gọi Gemini:", data.error?.message || "Unknown error");
    return;
  }

  console.log("✅ Kết quả:", data.candidates[0].content.parts[0].text);
}

testGemini();
