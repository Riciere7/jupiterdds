const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const secret = process.env.JWT_SECRET || 'dds_secret';

router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  db.get('SELECT id, nome, email, perfil FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign({ id: row.id, nome: row.nome, email: row.email, perfil: row.perfil }, secret, {
      expiresIn: '8h'
    });

    res.json({ user: row, token });
  });
});

module.exports = router;
