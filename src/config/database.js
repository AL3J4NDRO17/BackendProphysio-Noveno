require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuración avanzada de Sequelize con Pool de Conexiones
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    timezone: 'UTC',  // Esto garantizaría que todas las fechas estén en UTC
    dialect: process.env.DB_DIALECT || 'postgres', // Permite flexibilidad en .env
    logging: process.env.DB_LOGGING === 'true', // Habilitar o deshabilitar logs según .env
    pool: {
      max: 10, // Máximo de conexiones activas
      min: 0,  // Mínimo de conexiones activas
      acquire: 30000, // Tiempo máximo para obtener conexión (ms)
      idle: 10000, // Tiempo de inactividad antes de liberar conexión (ms)
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // importante para Render
      },
    },
  }
);

// Función para autenticar la base de datos antes de exportarla
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('🟢 Conexión a la base de datos establecida con éxito.');
  } catch (error) {
    console.error('🔴 Error al conectar a la base de datos:', error);
    process.exit(1); // 🔥 Detener la app si no se conecta la BD
  }
};

// Exportar Sequelize y l
module.exports = { sequelize, connectDB };
