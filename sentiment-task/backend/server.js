const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Banco de dados SQLite
const db = new sqlite3.Database('./tasks.db');

// Criar tabela
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    sentiment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// API do Hugging Face (modelo de análise de sentimentos)
async function analyzeSentiment(text) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
      { inputs: text },
      { headers: { 'Authorization': 'Bearer YOUR_HF_API_KEY' } }
    );
    return response.data[0][0].label;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return 'neutral';
  }
}

// Rotas
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

app.post('/tasks', async (req, res) => {
  const { text } = req.body;
  const sentiment = await analyzeSentiment(text);
  
  db.run(
    'INSERT INTO tasks (text, sentiment) VALUES (?, ?)',
    [text, sentiment],
    function(err) {
      if (err) return res.status(500).send(err.message);
      res.json({ id: this.lastID, text, sentiment });
    }
  );
});

app.delete('/tasks/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(200);
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});