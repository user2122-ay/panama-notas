const mongoose = require('mongoose');

const materiaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nombre: { type: String, required: true, trim: true },
  profesor: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Materia', materiaSchema);
