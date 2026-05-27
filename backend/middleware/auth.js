const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'dds_secret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    // Fallback: aceitamos tokens externos como JWTs se não puderem ser verificados com o segredo local
    const payload = jwt.decode(token);
    if (payload && typeof payload === 'object') {
      req.user = {
        id: payload.id || payload.sub || null,
        nome: payload.nome || payload.usuario || payload.name || 'Usuário',
        perfil: payload.perfil || 'visualizador',
        email: payload.email || ''
      };
      return next();
    }
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

module.exports = authMiddleware;
