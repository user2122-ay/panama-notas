const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  colegio: { type: String, trim: true, default: '' },
  grado: { type: String, trim: true, default: '' }, // ej. "9no B"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
