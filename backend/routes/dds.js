const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('../db');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

function requireAdmin(req, res, next) {
  if (req.user && req.user.perfil === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem executar esta ação.' });
}

router.get('/', (req, res) => {
  const filters = [];
  const values = [];
  const { operador, dia, mes, ano, cidade, estado, incluirDesabilitados, conferido } = req.query;

  let query = `SELECT d.*, o.nome AS operador_nome, c.nome AS cidade_nome, c.estado AS estado_nome
    FROM dds d
    LEFT JOIN operadores o ON d.operador_id = o.id
    LEFT JOIN cidades c ON d.cidade_id = c.id
    WHERE 1=1`;

  if (operador) {
    filters.push('o.nome = ?');
    values.push(operador);
  }
  if (dia) {
    filters.push("strftime('%d', d.data_dds) = ?");
    values.push(dia.padStart(2, '0'));
  }
  if (mes) {
    filters.push("strftime('%m', d.data_dds) = ?");
    values.push(mes.padStart(2, '0'));
  }
  if (ano) {
    filters.push("strftime('%Y', d.data_dds) = ?");
    values.push(ano);
  }
  if (cidade) {
    filters.push('c.nome = ?');
    values.push(cidade);
  }
  if (estado) {
    filters.push('c.estado = ?');
    values.push(estado);
  }
  if (!incluirDesabilitados) {
    filters.push("d.status = 'ativo'");
  }
  if (conferido === 'sim') {
    filters.push('d.conferido = 1');
  } else if (conferido === 'nao') {
    filters.push('d.conferido = 0');
  }

  if (filters.length) {
    query += ' AND ' + filters.join(' AND ');
  }
  query += ' ORDER BY d.data_dds DESC';

  db.all(query, values, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id/anexos', (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM anexos_dds WHERE dds_id = ? ORDER BY criado_em DESC', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map((row) => ({
      ...row,
      url: row.caminho_arquivo.replace(/\\/g, '/')
    })));
  });
});

router.post('/:id/anexos', upload.array('anexos', 5), (req, res) => {
  const { id } = req.params;
  const insertAnexo = db.prepare('INSERT INTO anexos_dds (dds_id, tipo, nome_arquivo, caminho_arquivo) VALUES (?, ?, ?, ?)');

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  req.files.forEach((file) => {
    const tipo = file.mimetype.includes('video') ? 'video' : 'pdf';
    insertAnexo.run(id, tipo, file.originalname, file.path);
  });

  insertAnexo.finalize((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

router.delete('/anexos/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT caminho_arquivo FROM anexos_dds WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Anexo não encontrado.' });

    const filePath = path.resolve(row.caminho_arquivo);
    fs.unlink(filePath, () => {
      db.run('DELETE FROM anexos_dds WHERE id = ?', [id], function (deleteErr) {
        if (deleteErr) return res.status(500).json({ error: deleteErr.message });
        res.json({ deleted: this.changes });
      });
    });
  });
});

router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  db.get('SELECT id FROM dds WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'DDS não encontrado.' });

    db.all('SELECT caminho_arquivo FROM anexos_dds WHERE dds_id = ?', [id], (fileErr, attachments) => {
      if (fileErr) return res.status(500).json({ error: fileErr.message });

      attachments.forEach((attachment) => {
        if (attachment.caminho_arquivo) {
          const filePath = path.resolve(attachment.caminho_arquivo);
          fs.unlink(filePath, () => {});
        }
      });

      db.run('DELETE FROM anexos_dds WHERE dds_id = ?', [id], (deleteAttachmentsErr) => {
        if (deleteAttachmentsErr) return res.status(500).json({ error: deleteAttachmentsErr.message });

        db.run('DELETE FROM dds WHERE id = ?', [id], function (deleteDdsErr) {
          if (deleteDdsErr) return res.status(500).json({ error: deleteDdsErr.message });
          res.json({ deleted: this.changes });
        });
      });
    });
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT d.*, o.nome AS operador_nome, c.nome AS cidade_nome, c.estado AS estado_nome
    FROM dds d
    LEFT JOIN operadores o ON d.operador_id = o.id
    LEFT JOIN cidades c ON d.cidade_id = c.id
    WHERE d.id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'DDS não encontrado.' });
    res.json(row);
  });
});

router.post('/', upload.array('anexos', 5), (req, res) => {
  const { titulo, descricao, operador_id, cidade_id, data_dds, status, conferido } = req.body;
  const stmt = db.prepare(`INSERT INTO dds (titulo, descricao, operador_id, cidade_id, data_dds, status, conferido)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);

  stmt.run(titulo, descricao, operador_id, cidade_id, data_dds, status || 'ativo', conferido ? 1 : 0, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const ddsId = this.lastID;
    const insertAnexo = db.prepare('INSERT INTO anexos_dds (dds_id, tipo, nome_arquivo, caminho_arquivo) VALUES (?, ?, ?, ?)');

    if (req.files && req.files.length) {
      req.files.forEach((file) => {
        const tipo = file.mimetype.includes('video') ? 'video' : 'pdf';
        insertAnexo.run(ddsId, tipo, file.originalname, file.path);
      });
    }

    insertAnexo.finalize((insertErr) => {
      if (insertErr) return res.status(500).json({ error: insertErr.message });
      res.json({ id: ddsId, titulo });
    });
  });
});

router.patch('/:id/conferir', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE dds SET conferido = 1 WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

module.exports = router;
