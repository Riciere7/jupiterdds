const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database.');
  }
});

const defaultOperators = ['Operador A', 'Operador B', 'Operador C'];
const defaultCities = [
  { nome: 'Açailândia', estado: 'Maranhão' },
  { nome: 'Amarante do Maranhão', estado: 'Maranhão' },
  { nome: 'Campestre do Maranhão', estado: 'Maranhão' },
  { nome: 'Cidelândia', estado: 'Maranhão' },
  { nome: 'Davinópolis', estado: 'Maranhão' },
  { nome: 'Estreito', estado: 'Maranhão' },
  { nome: 'Governador Edison Lobão', estado: 'Maranhão' },
  { nome: 'Grajaú', estado: 'Maranhão' },
  { nome: 'Imperatriz', estado: 'Maranhão' },
  { nome: 'João Lisboa', estado: 'Maranhão' },
  { nome: 'Marabá', estado: 'Pará' },
  { nome: 'Parauapebas', estado: 'Pará' },
  { nome: 'Porto Franco', estado: 'Maranhão' },
  { nome: 'Ribamar Fiquene', estado: 'Maranhão' },
  { nome: 'São Francisco do Brejão', estado: 'Maranhão' },
  { nome: 'São Pedro da Água Branca', estado: 'Maranhão' },
  { nome: 'Senador La Rocque', estado: 'Maranhão' },
  { nome: 'Sítio Novo', estado: 'Maranhão' },
  { nome: 'Vila Nova dos Martírios', estado: 'Maranhão' }
];

const init = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      perfil TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS operadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS cidades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      estado TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS dds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      operador_id INTEGER,
      cidade_id INTEGER,
      data_dds TEXT,
      status TEXT DEFAULT 'ativo',
      conferido INTEGER DEFAULT 0,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (operador_id) REFERENCES operadores(id),
      FOREIGN KEY (cidade_id) REFERENCES cidades(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS anexos_dds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dds_id INTEGER,
      tipo TEXT,
      nome_arquivo TEXT,
      caminho_arquivo TEXT,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dds_id) REFERENCES dds(id)
    )`);

    db.get('SELECT COUNT(*) AS count FROM operadores', (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare('INSERT INTO operadores (nome) VALUES (?)');
        defaultOperators.forEach((nome) => stmt.run(nome));
        stmt.finalize();
      }
    });

    db.get('SELECT COUNT(*) AS count FROM cidades', (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare('INSERT INTO cidades (nome, estado) VALUES (?, ?)');
        defaultCities.forEach((cidade) => stmt.run(cidade.nome, cidade.estado));
        stmt.finalize();
      }
    });

    db.get('SELECT COUNT(*) AS count FROM usuarios', (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)');
        stmt.run('Admin DDS', 'admin@dds.com', 'admin123', 'admin');
        stmt.run('Visualizador DDS', 'viewer@dds.com', 'viewer123', 'visualizador');
        stmt.finalize();
      }
    });
  });
};

init();
module.exports = db;
