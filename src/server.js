import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import container from './config/container.js';

// Cargar variables de entorno
dotenv.config();

// Definir puerto
const PORT = process.env.PORT || 3000;

// Crear servidor HTTP
const server = http.createServer(app);

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    // Inicializar el servicio de Socket.IO con el servidor HTTP
  const socketService = container.resolve('realTimeService');
  if (socketService && typeof socketService.init === 'function') {
    socketService.init(server);
    console.log('Socket.IO service attached to HTTP server');
    
    // Inicializar el controlador WebSocket
    const webSocketController = container.resolve('webSocketController');
    if (webSocketController && typeof webSocketController.initialize === 'function') {
      webSocketController.initialize();
      console.log('WebSocket controller initialized successfully');
    } else {
      console.error('Failed to initialize WebSocket controller');
    }
  } else {
    console.error('Failed to initialize Socket.IO service');
  }
});