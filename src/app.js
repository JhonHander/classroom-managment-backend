import express from 'express';
import cors from 'express'; // Para permitir solicitudes cross-origin
import morgan from 'morgan'; // Para logging de solicitudes HTTP
import { connect, sync } from './config/database.js'; // Importar la función de conexión a la BD
import userRoutes from './interfaces/routes/user.routes.js';
import classroomRoutes from './interfaces/routes/classroom.routes.js'; // Importar las rutas de classroom
// import classroomRoutes from './interfaces/routes/classroom.routes.js';

const app = express();

// Middleware básico
app.use(express.json()); // Para parsear JSON en el body
app.use(express.urlencoded({ extended: true })); // Para parsear formularios
app.use(cors()); // Habilitar CORS para todas las rutas

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Conectar a la base de datos
connect()
  .then(() => {
    console.log('Database connected successfully');
    // Luego sincronizar (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      return sync();
    }
  })
  .catch(err => console.error('Database error:', err));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Classroom Management API' });
});

// Rutas de la API
app.use('/api/users', userRoutes);
   
// app.use('/api/classrooms', classroomRoutes);
app.use('/api/classroom', classroomRoutes); 
// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

export default app;
