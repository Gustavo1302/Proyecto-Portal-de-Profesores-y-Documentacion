const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Teacher = require('../models/Teacher');

// POST /api/documents/upload
const uploadDocument = async (req, res) => {
  try {
    const { title, description, type, authorEmail } = req.body;

    if (!title || !description || !type || !authorEmail) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió archivo' });
    }

    const teacher = await Teacher.findOne({ email: authorEmail });
    if (!teacher) {
      return res.status(404).json({ message: 'Autor no encontrado' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const document = new Document({
      title,
      description,
      type,
      fileUrl,
      authorName: teacher.nombre,
      authorEmail: teacher.email,
      teacher: teacher._id
    });

    await document.save();
    return res.status(201).json({ message: 'Documento subido correctamente', document });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

// GET /api/documents
const listDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    return res.status(200).json(documents);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

// GET /api/documents/author/:email
const listDocumentsByAuthor = async (req, res) => {
  try {
    const { email } = req.params;
    const documents = await Document.find({ authorEmail: email }).sort({ createdAt: -1 });
    return res.status(200).json(documents);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};
// PUT /api/documents/:id
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, authorEmail } = req.body;

    if (!title || !description || !type || !authorEmail) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    if (document.authorEmail !== authorEmail) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este documento' });
    }

    document.title = title;
    document.description = description;
    document.type = type;

    if (req.file) {
      const oldPath = document.fileUrl ? path.join(__dirname, '..', document.fileUrl) : null;
      const newFileUrl = `/uploads/${req.file.filename}`;
      document.fileUrl = newFileUrl;

      if (oldPath && fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error('No se pudo eliminar el archivo anterior:', e);
        }
      }
    }

    await document.save();
    return res.status(200).json({ message: 'Documento actualizado correctamente', document });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

// DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const authorEmail = req.query.authorEmail;

    if (!authorEmail) {
      return res.status(400).json({ message: 'Correo del autor requerido' });
    }

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    if (document.authorEmail !== authorEmail) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este documento' });
    }

    const filePath = document.fileUrl ? path.join(__dirname, '..', document.fileUrl) : null;

    await document.deleteOne();

    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('No se pudo eliminar el archivo:', e);
      }
    }

    return res.status(200).json({ message: 'Documento eliminado correctamente' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = { uploadDocument, listDocuments, listDocumentsByAuthor, updateDocument, deleteDocument };
