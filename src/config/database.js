// filepath: c:\Users\jhonh\OneDrive\Escritorio\Clases_U\programacion_movil\classroom-managment-backend\src\config\database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import initModels from '../infrastructure/db/models/index.js';

dotenv.config();

// Crear instancia de Sequelize
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

// Inicializar modelos y establecer sus relaciones
export const models = initModels(sequelize);

export const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
};

export const sync = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('Error al sincronizar modelos:', error);
  }
};