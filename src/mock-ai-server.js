import express from 'express';

const app = express();
app.use(express.json());

app.post('/mock-ai', async (req, res) => {
  const { queryText, context } = req.body;

  // 🔹 Simulate delay
  const delay = Math.random() * 1500;

  await new Promise((r) => setTimeout(r, delay));

  // 🔹 Simulate failure (30% chance)
  if (Math.random() < 0.3) {
    return res.status(500).json({ error: 'AI failure' });
  }

  return res.json({
    insight: `Insight for "${queryText}" in ${context.industry}`,
  });
});

app.listen(4000, () => {
  console.log('Mock AI running on port 4000');
});