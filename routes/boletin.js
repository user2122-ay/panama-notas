const express = require('express');
const Materia = require('../models/Materia');
const Nota = require('../models/Nota');
const Ausencia = require('../models/Ausencia');
const protect = require('../middleware/auth');
const { calcularNotaMateria, calcularPromedioGeneral } = require('../utils/calculos');

const router = express.Router();
router.use(protect);

// GET /api/boletin/:trimestre -> boletín completo de ese trimestre
router.get('/:trimestre', async (req, res) => {
  const trimestre = Number(req.params.trimestre);
  if (![1, 2, 3].includes(trimestre)) {
    return res.status(400).json({ error: 'Trimestre inválido' });
  }

  const materias = await Materia.find({ user: req.userId }).sort('nombre');

  const resultado = await Promise.all(materias.map(async (materia) => {
    const notas = await Nota.find({ user: req.userId, materia: materia._id, trimestre });
    const ausencias = await Ausencia.countDocuments({ user: req.userId, materia: materia._id, trimestre });
    const calculo = calcularNotaMateria(notas);
    return {
      materiaId: materia._id,
      materia: materia.nombre,
      ...calculo,
      ausencias
    };
  }));

  const promedioGeneral = calcularPromedioGeneral(resultado.map(r => r.notaFinal));

  res.json({ trimestre, materias: resultado, promedioGeneral });
});

module.exports = router;
