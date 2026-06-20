const express = require('express');
const Materia = require('../models/Materia');
const Nota = require('../models/Nota');
const Ausencia = require('../models/Ausencia');
const protect = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  const materias = await Materia.find({ user: req.userId }).sort('nombre');
  res.json(materias);
});

router.post('/', async (req, res) => {
  const { nombre, profesor } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre de la materia es requerido' });
  const materia = await Materia.create({ user: req.userId, nombre, profesor });
  res.status(201).json(materia);
});

router.delete('/:id', async (req, res) => {
  const materia = await Materia.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!materia) return res.status(404).json({ error: 'Materia no encontrada' });
  // Limpieza en cascada de notas y ausencias asociadas
  await Nota.deleteMany({ materia: materia._id, user: req.userId });
  await Ausencia.deleteMany({ materia: materia._id, user: req.userId });
  res.json({ ok: true });
});

module.exports = router;
