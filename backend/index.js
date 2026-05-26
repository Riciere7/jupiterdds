const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const ddsRoutes = require('./routes/dds');
const operatorsRoutes = require('./routes/operators');
const citiesRoutes = require('./routes/cities');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api', authMiddleware);
app.use('/api/dds', ddsRoutes);
app.use('/api/operators', operatorsRoutes);
app.use('/api/cities', citiesRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
