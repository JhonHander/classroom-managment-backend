/**
 * WebSocketServerTest.js
 * Servidor para probar la integración con clientes WebSocket
 */
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import WebSocketController from './src/interfaces/controllers/WebSocketController.js';

// Configuración
const PORT = 3000;

// Clase simplificada del servicio de Socket.IO
class SimpleSocketIOService {
  constructor() {
    this.io = null;
    this.clients = new Map();
  }

  init(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`Cliente conectado: ${socket.id}`);
      
      this.clients.set(socket.id, {
        id: socket.id,
        userId: null,
        rooms: []
      });

      socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
        this.clients.delete(socket.id);
      });
    });

    console.log('Servicio Socket.IO inicializado');
    return Promise.resolve(this.io);
  }

  emitToRoom(room, event, data) {
    if (!this.io) return false;
    console.log(`Emitiendo evento '${event}' a sala '${room}'`);
    this.io.to(room).emit(event, data);
    return true;
  }

  emitToUser(userId, event, data) {
    if (!this.io) return false;
    console.log(`Emitiendo evento '${event}' a usuario '${userId}'`);
    this.io.to(`user-${userId}`).emit(event, data);
    return true;
  }

  broadcast(event, data) {
    if (!this.io) return false;
    console.log(`Emitiendo broadcast '${event}'`);
    this.io.emit(event, data);
    return true;
  }

  getStats() {
    return {
      clientsCount: this.clients.size,
      io: this.io ? 'active' : 'inactive',
      timestamp: new Date()
    };
  }
}

async function startServer() {
  // Crear aplicación Express
  const app = express();
  
  // Configurar ruta para servir el archivo test-client.html
  app.get('/', (req, res) => {
    res.sendFile('test-client.html', { root: '.' });
  });
  
  // Crear servidor HTTP
  const server = http.createServer(app);
  
  // Crear servicio Socket.IO
  const socketService = new SimpleSocketIOService();
  await socketService.init(server);
  
  // Crear controlador WebSocket
  const webSocketController = new WebSocketController(socketService);
  webSocketController.initialize();
  
  // Iniciar servidor HTTP
  server.listen(PORT, () => {
    console.log(`Servidor de prueba WebSocket ejecutándose en http://localhost:${PORT}`);
    
    // Imprimir menú de comandos
    console.log('\n--- Comandos disponibles ---');
    console.log('1: Enviar notificación de cambio de ocupación');
    console.log('2: Enviar notificación de cambio de reserva');
    console.log('3: Enviar notificación de actualización de disponibilidad');
    console.log('4: Mostrar estadísticas');
    console.log('5: Salir');
    
    // Configurar interfaz para enviar comandos
    process.stdin.on('data', (data) => {
      const input = data.toString().trim();
      
      switch (input) {
        case '1':
          // Enviar notificación de cambio de ocupación
          const classroomId = 'classroom123';
          webSocketController.notifyOccupancyChange(classroomId, {
            isOccupied: Math.random() > 0.5,
            source: 'sensor',
            confidence: Math.random(),
            lastUpdated: new Date()
          });
          console.log(`Enviada notificación de cambio de ocupación para aula ${classroomId}`);
          break;
          
        case '2':
          // Enviar notificación de cambio de reserva
          webSocketController.notifyReservationChange({
            id: `reservation-${Date.now()}`,
            classroomId: 'classroom123',
            userId: 'user456',
            status: 'confirmed',
            startTime: new Date(),
            endTime: new Date(Date.now() + 3600000)
          });
          console.log('Enviada notificación de cambio de reserva');
          break;
          
        case '3':
          // Enviar notificación de actualización de disponibilidad
          webSocketController.notifyAvailabilityUpdate([
            { id: 'classroom123', available: Math.random() > 0.5, capacity: 30 },
            { id: 'classroom456', available: Math.random() > 0.5, capacity: 20 },
            { id: 'classroom789', available: Math.random() > 0.5, capacity: 50 }
          ]);
          console.log('Enviada notificación de actualización de disponibilidad');
          break;
          
        case '4':
          // Mostrar estadísticas
          const stats = webSocketController.getStats();
          console.log('Estadísticas actuales:', stats);
          break;
          
        case '5':
          // Salir
          console.log('Cerrando servidor...');
          server.close(() => process.exit(0));
          break;
          
        default:
          console.log('Comando no reconocido. Opciones: 1-5');
      }
      
      // Recordar las opciones
      console.log('\nSelecciona una opción (1-5):');
    });
    
    console.log('\nSelecciona una opción (1-5):');
  });
  
  return { app, server, socketService, webSocketController };
}

// Iniciar el servidor
startServer().catch(console.error);
