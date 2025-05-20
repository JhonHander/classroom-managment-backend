/**
 * manualWebSocketTest.js
 * Prueba manual para el WebSocketController
 */

import WebSocketController from './src/interfaces/controllers/WebSocketController.js';

// Mock para el servicio SocketIO
class MockSocketIOService {
  constructor() {
    this.io = {
      on: (event, callback) => {
        console.log(`Registrado manejador para evento '${event}'`);
        if (event === 'connection') {
          // Simular una conexión
          const mockSocket = {
            id: 'socket-123',
            on: (event, handler) => {
              console.log(`Socket ${this.id} registró manejador para '${event}'`);
            },
            join: (room) => {
              console.log(`Socket ${this.id} se unió a la sala '${room}'`);
            },
            emit: (event, data) => {
              console.log(`Socket ${this.id} emitió evento '${event}' con datos:`, data);
            }
          };
          callback(mockSocket);
        }
      }
    };
    console.log('Mock SocketIOService creado');
  }

  emitToRoom(room, event, data) {
    console.log(`Emitiendo evento '${event}' a sala '${room}' con datos:`, data);
    return true;
  }

  emitToUser(userId, event, data) {
    console.log(`Emitiendo evento '${event}' a usuario '${userId}' con datos:`, data);
    return true;
  }

  broadcast(event, data) {
    console.log(`Emitiendo broadcast de evento '${event}' con datos:`, data);
    return true;
  }

  getStats() {
    return {
      clientsCount: 5,
      io: 'active',
      timestamp: new Date()
    };
  }
}

// Función principal para ejecutar las pruebas
async function runTests() {
  console.log('Iniciando pruebas manuales de WebSocketController...');
  
  // Crear instancias
  const mockRealTimeService = new MockSocketIOService();
  const webSocketController = new WebSocketController(mockRealTimeService);
  
  // Inicializar el controlador
  console.log('\n1. Prueba de inicialización:');
  webSocketController.initialize();
  
  // Probar notifyOccupancyChange
  console.log('\n2. Prueba de notifyOccupancyChange:');
  const classroomId = 'classroom123';
  const occupancyData = {
    isOccupied: true,
    source: 'sensor',
    confidence: 0.95
  };
  webSocketController.notifyOccupancyChange(classroomId, occupancyData);
  
  // Probar notifyReservationChange
  console.log('\n3. Prueba de notifyReservationChange:');
  const reservationData = {
    id: 'reservation123',
    classroomId: 'classroom123',
    userId: 'user123',
    status: 'confirmed',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000)
  };
  webSocketController.notifyReservationChange(reservationData);
  
  // Probar notifyAvailabilityUpdate
  console.log('\n4. Prueba de notifyAvailabilityUpdate:');
  const classroomsData = [
    { id: 'classroom123', available: true, capacity: 30 },
    { id: 'classroom456', available: false, capacity: 20 }
  ];
  webSocketController.notifyAvailabilityUpdate(classroomsData);
  
  // Probar getStats
  console.log('\n5. Prueba de getStats:');
  const stats = webSocketController.getStats();
  console.log('Estadísticas:', stats);
  
  console.log('\nPruebas completadas con éxito');
}

// Ejecutar las pruebas
runTests().catch(err => {
  console.error('Error en las pruebas:', err);
});
