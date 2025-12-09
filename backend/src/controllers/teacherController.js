const bcrypt = require('bcrypt');
const Teacher = require('../models/Teacher');

const registerTeacher = async (req, res) => {
  try {
    const { nombre, email, asignaturas, institucion, password, confirmar } = req.body;

    if (!nombre || !email || !password || !confirmar) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    if (password !== confirmar) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    const existing = await Teacher.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const asignaturasArray = asignaturas ? asignaturas.split(',').map(s => s.trim()).filter(Boolean) : [];

    const teacher = new Teacher({
      nombre,
      email,
      asignaturas: asignaturasArray,
      institucion,
      passwordHash
    });

    await teacher.save();
    return res.status(201).json({ message: 'Profesor registrado' });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, teacher.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      teacher: {
        id: teacher._id,
        nombre: teacher.nombre,
        email: teacher.email,
        asignaturas: teacher.asignaturas,
        institucion: teacher.institucion
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { nombre, email, asignaturas, institucion, currentPassword, newPassword } = req.body;
    const teacherEmail = req.body.email; // El email actual del usuario

    if (!nombre || !email || !asignaturas || !institucion) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }

    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
    }

    // Si intenta cambiar contraseña
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Contraseña actual requerida' });
      }

      const isMatch = await bcrypt.compare(currentPassword, teacher.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
      }

      const salt = await bcrypt.genSalt(10);
      teacher.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    // Actualizar datos
    const asignaturasArray = asignaturas.split(',').map(s => s.trim()).filter(Boolean);
    teacher.nombre = nombre;
    teacher.email = email;
    teacher.asignaturas = asignaturasArray;
    teacher.institucion = institucion;

    await teacher.save();
    return res.status(200).json({ success: true, message: 'Perfil actualizado correctamente' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

module.exports = { registerTeacher, loginTeacher, updateTeacher };