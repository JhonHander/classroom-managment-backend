/**
 * WebSocketController.test.js
 * Pruebas unitarias para WebSocketController
 */

import WebSocketController from '../WebSocketController.js';

// Mock para el console.warn para evitar ruido en los tests
console.warn = jest.fn();

// Mock para SocketIOService
class MockSocketIOService {
  constructor() {
    this.io = {
      on: jest.fn(),
    };
    this.emitToRoom = jest.fn();
    this.emitToUser = jest.fn();
    this.broadcast = jest.fn();
    this.getStats = jest.fn().mockReturnValue({
      clientsCount: 5,
      io: 'active',
      timestamp: new Date(),
    });
  }

  // Mock para init
  init() {
    return Promise.resolve();
  }
}

describe('WebSocketController', () => {
  let webSocketController;
  let mockRealTimeService;

  beforeEach(() => {
    // Crear una nueva instancia del mock para cada prueba
    mockRealTimeService = new MockSocketIOService();
    webSocketController = new WebSocketController(mockRealTimeService);

    // Espiar los métodos privados
    webSocketController._setupConnectionEvents = jest.fn();
    webSocketController._setupRoomEvents = jest.fn();
    webSocketController._setupOccupancyEvents = jest.fn();
    webSocketController._setupReservationEvents = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('debería configurar todos los eventos cuando realTimeService está listo', () => {
      // Ejecutar el método a probar
      webSocketController.initialize();

      // Verificar que se llamaron todos los métodos de configuración
      expect(webSocketController._setupConnectionEvents).toHaveBeenCalledTimes(1);
      expect(webSocketController._setupRoomEvents).toHaveBeenCalledTimes(1);
      expect(webSocketController._setupOccupancyEvents).toHaveBeenCalledTimes(1);
      expect(webSocketController._setupReservationEvents).toHaveBeenCalledTimes(1);
    });

    it('no debería configurar eventos si realTimeService no está listo', () => {
      // Modificar el mock para simular que realTimeService no está listo
      mockRealTimeService.io = null;
      
      // Espiar console.warn
      console.warn = jest.fn();
      
      // Ejecutar el método a probar
      webSocketController.initialize();

      // Verificar que no se llamaron los métodos de configuración
      expect(webSocketController._setupConnectionEvents).not.toHaveBeenCalled();
      expect(webSocketController._setupRoomEvents).not.toHaveBeenCalled();
      expect(webSocketController._setupOccupancyEvents).not.toHaveBeenCalled();
      expect(webSocketController._setupReservationEvents).not.toHaveBeenCalled();
      
      // Verificar que se mostró una advertencia
      expect(console.warn).toHaveBeenCalledWith(
        'No se puede inicializar WebSocketController: realTimeService no está listo'
      );
    });
  });

  describe('notifyOccupancyChange', () => {
    it('debería emitir eventos a las salas correspondientes', () => {
      // Datos para la prueba
      const classroomId = 'classroom123';
      const occupancyData = {
        isOccupied: true,
        source: 'sensor',
        confidence: 0.95,
      };

      // Ejecutar el método a probar
      webSocketController.notifyOccupancyChange(classroomId, occupancyData);

      // Verificar que se emitieron los eventos a las salas correctas
      expect(mockRealTimeService.emitToRoom).toHaveBeenCalledTimes(2);
      
      // Verificar la llamada a 'occupancy-updates'
      expect(mockRealTimeService.emitToRoom).toHaveBeenCalledWith(
        'occupancy-updates',
        'occupancy-changed',
        expect.objectContaining({
          classroomId,
          isOccupied: true,
          source: 'sensor',
          confidence: 0.95,
          timestamp: expect.any(Date),
        })
      );
      
      // Verificar la llamada a la sala específica del aula
      expect(mockRealTimeService.emitToRoom).toHaveBeenCalledWith(
        `classroom-${classroomId}`,
        'classroom-occupancy-changed',
        expect.objectContaining({
          classroomId,
          isOccupied: true,
          source: 'sensor',
          confidence: 0.95,
          timestamp: expect.any(Date),
        })
      );
    });

    it('no debería emitir eventos si realTimeService no está disponible', () => {
      // Establecer realTimeService como null
      webSocketController.realTimeService = null;
      
      // Ejecutar el método a probar
      webSocketController.notifyOccupancyChange('classroom123', { isOccupied: true });

      // Verificar que no se intentó emitir ningún evento
      expect(mockRealTimeService.emitToRoom).not.toHaveBeenCalled();
    });
  });

  describe('notifyReservationChange', () => {
    it('debería emitir eventos de cambio de reserva a todos los suscriptores', () => {
      // Datos para la prueba
      const reservationData = {
        id: 'reservation123',
        classroomId: 'classroom123',
        status: 'confirmed',
      };

      // Ejecutar el método a probar
      webSocketController.notifyReservationChange(reservationData);

      // Verificar que se emitió el evento a la sala de actualizaciones de reservas
      expect(mockRealTimeService.emitToRoom).toHaveBeenCalledWith(
        'reservation-updates',
        'reservation-changed',
        expect.objectContaining({
          id: 'reservation123',
          classroomId: 'classroom123',
          status: 'confirmed',
          timestamp: expect.any(Date),
        })
      );
    });

    it('debería emitir eventos de cambio de reserva al usuario específico si hay un userId', () => {
      // Datos para la prueba, esta vez incluyendo un userId
      const reservationData = {
        id: 'reservation123',
        classroomId: 'classroom123',
        status: 'confirmed',
        userId: 'user123',
      };

      // Ejecutar el método a probar
      webSocketController.notifyReservationChange(reservationData);

      // Verificar que se emitió el evento a la sala de actualizaciones de reservas
      expect(mockRealTimeService.emitToRoom).toHaveBeenCalledWith(
        'reservation-updates',
        'reservation-changed',
        expect.objectContaining({
          id: 'reservation123',
          userId: 'user123',
          timestamp: expect.any(Date),
        })
      );

      // Verificar que se emitió el evento al usuario específico
      expect(mockRealTimeService.emitToUser).toHaveBeenCalledWith(
        'user123',
        'your-reservation-changed',
        expect.objectContaining({
          id: 'reservation123',
          userId: 'user123',
          timestamp: expect.any(Date),
        })
      );
    });

    it('no debería emitir eventos si realTimeService no está disponible', () => {
      // Establecer realTimeService como null
      webSocketController.realTimeService = null;
      
      // Ejecutar el método a probar
      webSocketController.notifyReservationChange({ id: 'reservation123' });

      // Verificar que no se intentó emitir ningún evento
      expect(mockRealTimeService.emitToRoom).not.toHaveBeenCalled();
      expect(mockRealTimeService.emitToUser).not.toHaveBeenCalled();
    });
  });

  describe('notifyAvailabilityUpdate', () => {
    it('debería emitir eventos de actualización de disponibilidad a todos los clientes', () => {
      // Datos para la prueba
      const classroomsData = [
        { id: 'classroom123', available: true },
        { id: 'classroom456', available: false },
      ];

      // Ejecutar el método a probar
      webSocketController.notifyAvailabilityUpdate(classroomsData);

      // Verificar que se emitió el evento a todos los clientes
      expect(mockRealTimeService.broadcast).toHaveBeenCalledWith(
        'availability-updated',
        expect.objectContaining({
          classrooms: classroomsData,
          timestamp: expect.any(Date),
        })
      );
    });

    it('no debería emitir eventos si realTimeService no está disponible', () => {
      // Establecer realTimeService como null
      webSocketController.realTimeService = null;
      
      // Ejecutar el método a probar
      webSocketController.notifyAvailabilityUpdate([{ id: 'classroom123' }]);

      // Verificar que no se intentó emitir ningún evento
      expect(mockRealTimeService.broadcast).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('debería devolver estadísticas cuando realTimeService está disponible', () => {
      // Ejecutar el método a probar
      const stats = webSocketController.getStats();

      // Verificar que se llamó al método getStats del servicio
      expect(mockRealTimeService.getStats).toHaveBeenCalled();
      
      // Verificar el resultado
      expect(stats).toEqual({
        status: 'active',
        clientsCount: 5,
        io: 'active',
        timestamp: expect.any(Date),
      });
    });

    it('debería devolver estadísticas de inactividad cuando realTimeService no está disponible', () => {
      // Establecer realTimeService como null
      webSocketController.realTimeService = null;
      
      // Ejecutar el método a probar
      const stats = webSocketController.getStats();

      // Verificar el resultado
      expect(stats).toEqual({
        status: 'inactive',
        clientsCount: 0,
      });
    });
  });
});
