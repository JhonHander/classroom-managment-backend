import dotenv from 'dotenv';
import app from './app.js';

// Cargar variables de entorno
dotenv.config();

// Definir puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});