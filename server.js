require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const materiasRoutes = require('./routes/materias');
const notasRoutes = require('./routes/notas');
const ausenciasRoutes = require('./routes/ausencias');
const boletinRoutes = require('./routes/boletin');

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/ausencias', ausenciasRoutes);
app.use('/api/boletin', boletinRoutes);

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Ruta no encontrada' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
