const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM operadores ORDER BY nome', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { nome } = req.body;
  const stmt = db.prepare('INSERT INTO operadores (nome) VALUES (?)');
  stmt.run(nome, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, nome });
  });
});

module.exports = router;
