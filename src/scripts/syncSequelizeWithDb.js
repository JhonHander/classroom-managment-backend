import { connect, sync } from '../config/database.js'; // Importar la función de conexión a la BD

// Función para sincronizar la base de datos
async function syncDatabase() {
  try {
    // Conectar a la base de datos
    await connect();
    console.log('Database connected successfully');
    
    // Sincronizar modelos
    // Usar { force: true } recreará todas las tablas (¡CUIDADO! Elimina datos existentes)
    // Usar { alter: true } intentará modificar las tablas existentes
    const options = { alter: true };
    await sync(options);
    
    console.log('Database sync completed');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

// Ejecutar la función
syncDatabase();