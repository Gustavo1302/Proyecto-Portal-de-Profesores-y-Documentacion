const mongoose = require('mongoose');

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB conectado: ${mongoose.connection.host}:${mongoose.connection.port} -> base: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;