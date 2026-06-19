const mongoose = require('mongoose');

const notaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  materia: { type: mongoose.Schema.Types.ObjectId, ref: 'Materia', required: true },
  trimestre: { type: Number, required: true, enum: [1, 2, 3] },
  tipo: { type: String, required: true, enum: ['diaria', 'apreciacion', 'examen'] },
  valor: { type: Number, required: true, min: 0, max: 100 },
  descripcion: { type: String, trim: true, default: '' }, // ej. "Quiz cap.3", "Tarea grupal"
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Nota', notaSchema);
