// src/scripts/testDbConnection.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { connect, models, sequelize } from '../config/database.js';

dotenv.config();

async function testConnection() {
  try {
    console.log('Intentando conectar a la base de datos con los siguientes parámetros:');
    console.log(`DB_NAME: ${process.env.DB_NAME}`);
    console.log(`DB_USER: ${process.env.DB_USER}`);
    console.log(`DB_HOST: ${process.env.DB_HOST}`);
    console.log(`DB_PORT: ${process.env.DB_PORT}`);
    
    // Conectar a la base de datos
    await connect();
    console.log('Conexión exitosa a la base de datos');
    
    // Verificar si hay roles en la base de datos
    const roles = await models.RoleModel.findAll();
    console.log('Roles encontrados:', roles.map(r => ({ id: r.id, name: r.name })));
    
    // Verificar si hay usuarios en la base de datos
    const users = await models.UserModel.findAll({
      include: [{ model: models.RoleModel, as: 'role' }]
    });
    console.log('Usuarios encontrados:', users.length);
    
    users.forEach(user => {
      console.log(`Usuario ID ${user.id}: ${user.name} ${user.lastName}, email: ${user.email}, rol: ${user.role ? user.role.name : 'sin rol'}`);
    });
    
    // Cerrar conexión
    await sequelize.close();
    console.log('Conexión cerrada correctamente');
  } catch (error) {
    console.error('Error al probar la conexión a la base de datos:', error);
  }
}

// Ejecutar la función
testConnection();

// node src/scripts/testDbConnection.js