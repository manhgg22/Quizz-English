export async function getExplanations(mistakes) {
  const res = await fetch('http://localhost:9999/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mistakes })
  });
  return await res.json();
}
