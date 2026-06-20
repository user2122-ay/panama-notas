const express = require('express');
const Nota = require('../models/Nota');
const protect = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/notas?materia=ID&trimestre=1
router.get('/', async (req, res) => {
  const { materia, trimestre } = req.query;
  const filtro = { user: req.userId };
  if (materia) filtro.materia = materia;
  if (trimestre) filtro.trimestre = Number(trimestre);
  const notas = await Nota.find(filtro).sort('-fecha');
  res.json(notas);
});

router.post('/', async (req, res) => {
  const { materia, trimestre, tipo, valor, descripcion, fecha } = req.body;
  if (!materia || !trimestre || !tipo || valor === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  if (valor < 0 || valor > 100) {
    return res.status(400).json({ error: 'La nota debe estar entre 0 y 100' });
  }
  const nota = await Nota.create({
    user: req.userId, materia, trimestre, tipo, valor, descripcion, fecha
  });
  res.status(201).json(nota);
});

router.delete('/:id', async (req, res) => {
  const nota = await Nota.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!nota) return res.status(404).json({ error: 'Nota no encontrada' });
  res.json({ ok: true });
});

module.exports = router;
