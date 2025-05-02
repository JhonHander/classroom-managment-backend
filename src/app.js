import express from 'express';
import userRoutes from './interfaces/routes/user.routes.js'; // ruta que acabas de crear

const app = express();
app.use(express.json()); // para poder leer JSON en el body

// Usamos la ruta base /usuarios
app.use('/usuarios', userRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000');
});
