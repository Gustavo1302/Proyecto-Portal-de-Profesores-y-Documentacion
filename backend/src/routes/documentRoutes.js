const express = require('express');
const path = require('path');
const multer = require('multer');
const { uploadDocument, listDocuments, listDocumentsByAuthor, updateDocument, deleteDocument } = require('../controllers/documentController');

const router = express.Router();

// Configuración de Multer para guardar en /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMime = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF o PPT/PPTX'));
  }
};

const upload = multer({ storage, fileFilter });

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', listDocuments);
router.get('/author/:email', listDocumentsByAuthor);
router.put('/:id', upload.single('file'), updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
