/**
 * WebSocketIntegration.test.js
 * Pruebas de integración para WebSocket
 */

import { io as Client } from 'socket.io-client';
import http from 'http';
import express from 'express';
import WebSocketController from '../WebSocketController.js';
import SocketIOService from '../../../infrastructure/services/SocketIOService.js';

describe('WebSocket Integration Tests', () => {
  let httpServer;
  let app;
  let realTimeService;
  let webSocketController;
  let clientSocket;
  let serverUrl;
  const PORT = 3001; // Puerto para pruebas

  beforeAll(async () => {
    // Crear una aplicación Express y un servidor HTTP para las pruebas
    app = express();
    httpServer = http.createServer(app);
    
    // Iniciar el servidor en el puerto de prueba
    await new Promise((resolve) => {
      httpServer.listen(PORT, resolve);
    });
    
    // URL para que el cliente se conecte
    serverUrl = `http://localhost:${PORT}`;
    
    // Inicializar SocketIOService con el servidor HTTP
    realTimeService = new SocketIOService();
    await realTimeService.init(httpServer);
    
    // Inicializar WebSocketController
    webSocketController = new WebSocketController(realTimeService);
    webSocketController.initialize();
    
    console.log('Test server started on port', PORT);
  });

  afterAll(async () => {
    // Limpiar después de las pruebas
    if (clientSocket) {
      clientSocket.disconnect();
    }
    
    // Cerrar el servidor HTTP
    await new Promise((resolve) => {
      httpServer.close(resolve);
    });
    
    console.log('Test server closed');
  });

  // Prueba de conexión básica
  test('debería permitir que un cliente se conecte al servidor WebSocket', (done) => {
    clientSocket = Client(serverUrl, {
      transports: ['websocket'],
      forceNew: true,
    });

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    clientSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      done.fail(error);
    });
  });

  // Prueba del evento ping/pong
  test('debería responder al evento ping con información del socket', (done) => {
    clientSocket = Client(serverUrl, {
      transports: ['websocket'],
      forceNew: true,
    });

    clientSocket.on('connect', () => {
      clientSocket.emit('ping', (response) => {
        expect(response).toHaveProperty('status', 'success');
        expect(response).toHaveProperty('socketId');
        expect(response).toHaveProperty('time');
        done();
      });
    });
  });

  // Prueba de registro de usuario
  test('debería registrar un usuario y unirlo a su sala personal', (done) => {
    clientSocket = Client(serverUrl, {
      transports: ['websocket'],
      forceNew: true,
    });

    clientSocket.on('connect', () => {
      const userId = 'test-user-123';
      
      clientSocket.on('user-registered', (response) => {
        expect(response).toHaveProperty('status', 'success');
        expect(response).toHaveProperty('userId', userId);
        expect(response).toHaveProperty('socketId');
        done();
      });

      clientSocket.emit('register-user', { userId });
    });
  });

  // Prueba de suscripción a un aula
  test('debería permitir que un cliente se suscriba a actualizaciones de un aula', (done) => {
    clientSocket = Client(serverUrl, {
      transports: ['websocket'],
      forceNew: true,
    });

    clientSocket.on('connect', () => {
      const classroomId = 'test-classroom-123';
      
      clientSocket.on('joined-classroom', (response) => {
        expect(response).toHaveProperty('status', 'success');
        expect(response).toHaveProperty('classroomId', classroomId);
        expect(response).toHaveProperty('room', `classroom-${classroomId}`);
        done();
      });

      clientSocket.emit('join-classroom', classroomId);
    });
  });

  // Prueba de recepción de notificación de cambio de ocupación
  test('debería recibir notificaciones de cambio de ocupación cuando está suscrito', (done) => {
    clientSocket = Client(serverUrl, {
      transports: ['websocket'],
      forceNew: true,
    });

    clientSocket.on('connect', () => {
      const classroomId = 'test-classroom-456';
      
      // Suscribirse a actualizaciones generales de ocupación
      clientSocket.emit('subscribe-occupancy-updates');
      
      // Suscribirse a actualizaciones específicas del aula
      clientSocket.emit('join-classroom', classroomId);
      
      // Esperar a recibir la notificación de cambio de ocupación
      clientSocket.on('occupancy-changed', (data) => {
        expect(data).toHaveProperty('classroomId', classroomId);
        expect(data).toHaveProperty('isOccupied', true);
        expect(data).toHaveProperty('timestamp');
        
        // La prueba es exitosa cuando recibimos la notificación general
        done();
      });
      
      // Simular un cambio de ocupación después de un breve retraso
      setTimeout(() => {
        webSocketController.notifyOccupancyChange(classroomId, {
          isOccupied: true,
          source: 'test',
          confidence: 1.0,
        });
      }, 500);
    });
  });

  // Prueba de recepción de notificación de cambio de reserva
  test('debería recibir notificaciones de cambio de reserva', (done) => {
    clientSocket = Client(serverUrl, {
      transports: ['websocket'],
      forceNew: true,
    });

    clientSocket.on('connect', () => {
      // Suscribirse a actualizaciones de reservas
      clientSocket.emit('subscribe-reservation-updates');
      
      // Esperar a recibir la notificación de cambio de reserva
      clientSocket.on('reservation-changed', (data) => {
        expect(data).toHaveProperty('id', 'test-reservation-123');
        expect(data).toHaveProperty('status', 'confirmed');
        expect(data).toHaveProperty('timestamp');
        done();
      });
      
      // Simular un cambio de reserva después de un breve retraso
      setTimeout(() => {
        webSocketController.notifyReservationChange({
          id: 'test-reservation-123',
          classroomId: 'test-classroom-789',
          status: 'confirmed',
        });
      }, 500);
    });
  });

  // Prueba de recepción de notificación de actualización de disponibilidad
  test('debería recibir notificaciones de actualización de disponibilidad', (done) => {
    clientSocket = Client(serverUrl, {
      transports: ['websocket'],
      forceNew: true,
    });

    clientSocket.on('connect', () => {
      // Esperar a recibir la notificación de actualización de disponibilidad
      clientSocket.on('availability-updated', (data) => {
        expect(data).toHaveProperty('classrooms');
        expect(data.classrooms).toHaveLength(2);
        expect(data.classrooms[0]).toHaveProperty('id', 'test-classroom-abc');
        expect(data.classrooms[1]).toHaveProperty('id', 'test-classroom-xyz');
        expect(data).toHaveProperty('timestamp');
        done();
      });
      
      // Simular una actualización de disponibilidad después de un breve retraso
      setTimeout(() => {
        webSocketController.notifyAvailabilityUpdate([
          { id: 'test-classroom-abc', available: true },
          { id: 'test-classroom-xyz', available: false },
        ]);
      }, 500);
    });
  });
});
