const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM cidades ORDER BY nome', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { nome, estado } = req.body;
  const stmt = db.prepare('INSERT INTO cidades (nome, estado) VALUES (?, ?)');
  stmt.run(nome, estado, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, nome, estado });
  });
});

module.exports = router;
