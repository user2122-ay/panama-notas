const mongoose = require('mongoose');

const ausenciaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  materia: { type: mongoose.Schema.Types.ObjectId, ref: 'Materia', required: true },
  trimestre: { type: Number, required: true, enum: [1, 2, 3] },
  fecha: { type: Date, default: Date.now },
  justificada: { type: Boolean, default: false },
  motivo: { type: String, trim: true, default: '' }
});

module.exports = mongoose.model('Ausencia', ausenciaSchema);
