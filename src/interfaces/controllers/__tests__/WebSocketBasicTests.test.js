/**
 * WebSocketBasicTests.test.js
 * Pruebas básicas para WebSocketController
 */

import WebSocketController from '../WebSocketController.js';

// Mock para SocketIOService simplificado
class MockSocketIOService {
  constructor() {
    this.io = {
      on: jest.fn(),
    };
    this.emitToRoom = jest.fn().mockReturnValue(true);
    this.emitToUser = jest.fn().mockReturnValue(true);
    this.broadcast = jest.fn().mockReturnValue(true);
    this.getStats = jest.fn().mockReturnValue({
      clientsCount: 5,
      io: 'active',
      timestamp: new Date(),
    });
  }
}

describe('WebSocketController Basic Tests', () => {
  let webSocketController;
  let mockRealTimeService;

  beforeEach(() => {
    // Crear una nueva instancia del mock para cada prueba
    mockRealTimeService = new MockSocketIOService();
    webSocketController = new WebSocketController(mockRealTimeService);
    
    // Silenciar console.warn
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('notifyOccupancyChange should emit to correct rooms', () => {
    // Arrange
    const classroomId = 'classroom123';
    const occupancyData = {
      isOccupied: true,
      source: 'sensor',
      confidence: 0.95,
    };

    // Act
    webSocketController.notifyOccupancyChange(classroomId, occupancyData);

    // Assert
    expect(mockRealTimeService.emitToRoom).toHaveBeenCalledTimes(2);
    expect(mockRealTimeService.emitToRoom).toHaveBeenCalledWith(
      'occupancy-updates',
      'occupancy-changed',
      expect.objectContaining({
        classroomId,
        isOccupied: true,
      })
    );
    expect(mockRealTimeService.emitToRoom).toHaveBeenCalledWith(
      `classroom-${classroomId}`,
      'classroom-occupancy-changed',
      expect.objectContaining({
        classroomId,
        isOccupied: true,
      })
    );
  });

  test('notifyAvailabilityUpdate should broadcast to all clients', () => {
    // Arrange
    const classroomsData = [
      { id: 'classroom123', available: true },
      { id: 'classroom456', available: false },
    ];

    // Act
    webSocketController.notifyAvailabilityUpdate(classroomsData);

    // Assert
    expect(mockRealTimeService.broadcast).toHaveBeenCalledTimes(1);
    expect(mockRealTimeService.broadcast).toHaveBeenCalledWith(
      'availability-updated',
      expect.objectContaining({
        classrooms: classroomsData,
      })
    );
  });
});
