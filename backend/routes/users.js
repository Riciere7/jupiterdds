const express = require('express');
const db = require('../db');

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user && req.user.perfil === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem cadastrar usuários.' });
}

router.get('/', (req, res) => {
  db.all('SELECT id, nome, email, perfil FROM usuarios ORDER BY nome', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', requireAdmin, (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  if (!nome || !email || !senha || !perfil) {
    return res.status(400).json({ error: 'Nome, e-mail, senha e perfil são obrigatórios.' });
  }

  if (!['admin', 'visualizador'].includes(perfil)) {
    return res.status(400).json({ error: 'Perfil inválido. Use "admin" ou "visualizador".' });
  }

  db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(409).json({ error: 'E-mail já está em uso.' });

    db.run('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)', [nome, email, senha, perfil], function (insertErr) {
      if (insertErr) return res.status(500).json({ error: insertErr.message });
      res.status(201).json({ id: this.lastID, nome, email, perfil });
    });
  });
});

router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  db.get('SELECT id FROM usuarios WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Usuário não encontrado.' });

    db.run('DELETE FROM usuarios WHERE id = ?', [id], function (deleteErr) {
      if (deleteErr) return res.status(500).json({ error: deleteErr.message });
      res.json({ deleted: this.changes });
    });
  });
});

module.exports = router;
