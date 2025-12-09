const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const teacherRoutes = require('./routes/teacherRoutes');
const documentRoutes = require('./routes/documentRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/teachers', teacherRoutes);
app.use('/api/documents', documentRoutes);

// Servir archivos estáticos (interfaces y uploads)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/teacher_db';

connectDB(MONGO_URI);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});