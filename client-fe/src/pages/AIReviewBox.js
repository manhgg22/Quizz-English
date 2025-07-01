



import React from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

export default function AIReviewBox({ explanation, index }) {
  let parsed = null;

  if (typeof explanation === 'string') {
    try {
      // Xóa bỏ markdown code block nếu có
      const cleaned = explanation
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.warn('Không thể parse JSON từ explanation:', err);
    }
  }

  return (
    <Card
      type="inner"
      title={`🧠 Giải thích câu sai ${index + 1}`}
      style={{ marginBottom: 10 }}
    >
      {parsed ? (
        <>
          <p><Text strong>Lý do sai:</Text> {parsed.why_wrong}</p>
          <p><Text strong>Cách sửa:</Text> {parsed.how_to_fix}</p>
          <p><Text strong>Lời khuyên:</Text> {parsed.recommendation}</p>
        </>
      ) : (
        <p style={{ whiteSpace: 'pre-wrap' }}>{explanation}</p>
      )}
    </Card>
  );
}
