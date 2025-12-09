const mongoose = require('mongoose');

const allowedTypes = [
  'Temas Importantes',
  'Proyectos Importantes',
  'Interesantes Temas a Investigar',
  'Universidades destacadas'
];

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 300 },
  type: { type: String, required: true, enum: allowedTypes },
  fileUrl: { type: String, required: true },
  authorName: { type: String, required: true, trim: true },
  authorEmail: { type: String, required: true, trim: true, lowercase: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
