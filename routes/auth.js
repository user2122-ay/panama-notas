const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/auth');

const router = express.Router();

function generarToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function enviarCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, colegio, grado } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    const existe = await User.findOne({ email: email.toLowerCase() });
    if (existe) return res.status(400).json({ error: 'Ese email ya está registrado' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ nombre, email, password: hash, colegio, grado });

    const token = generarToken(user._id);
    enviarCookie(res, token);
    res.status(201).json({ id: user._id, nombre: user.nombre, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Credenciales inválidas' });

    const token = generarToken(user._id);
    enviarCookie(res, token);
    res.json({ id: user._id, nombre: user.nombre, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
});

module.exports = router;
