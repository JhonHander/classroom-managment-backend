// filepath: c:\Users\jhonh\OneDrive\Escritorio\Clases_U\programacion_movil\classroom-managment-backend\src\config\database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
// Importa la función que define las asociaciones
import defineAssociations from '../infrastructure/db/models/associations.js';

dotenv.config();

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

// Variable para asegurar que las asociaciones se definan solo una vez
let associationsDefined = false;

export const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    // Define asociaciones después de autenticar si aún no se han definido
    if (!associationsDefined) {
      defineAssociations(); // Llama a la función exportada desde associations.js
      associationsDefined = true;
      console.log('Asociaciones de Sequelize definidas.');
    }
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
};

export const sync = async (options = {}) => {
  try {
    // Asegúrate que las asociaciones estén definidas antes de sincronizar
    if (!associationsDefined) {
      defineAssociations();
      associationsDefined = true;
      console.log('Asociaciones de Sequelize definidas antes de sync.');
    }
    await sequelize.sync(options);
    console.log('Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('Error al sincronizar modelos:', error);
  }
};