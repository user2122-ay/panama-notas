const express = require('express');
const Ausencia = require('../models/Ausencia');
const protect = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  const { materia, trimestre } = req.query;
  const filtro = { user: req.userId };
  if (materia) filtro.materia = materia;
  if (trimestre) filtro.trimestre = Number(trimestre);
  const ausencias = await Ausencia.find(filtro).sort('-fecha');
  res.json(ausencias);
});

router.post('/', async (req, res) => {
  const { materia, trimestre, fecha, justificada, motivo } = req.body;
  if (!materia || !trimestre) {
    return res.status(400).json({ error: 'Materia y trimestre son requeridos' });
  }
  const ausencia = await Ausencia.create({
    user: req.userId, materia, trimestre, fecha, justificada, motivo
  });
  res.status(201).json(ausencia);
});

router.delete('/:id', async (req, res) => {
  const ausencia = await Ausencia.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!ausencia) return res.status(404).json({ error: 'Ausencia no encontrada' });
  res.json({ ok: true });
});

module.exports = router;
