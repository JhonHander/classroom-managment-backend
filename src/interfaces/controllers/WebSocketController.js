/**
 * WebSocketController.js
 * Controlador para gestionar las comunicaciones WebSocket
 */

class WebSocketController {
  /**
   * Constructor del controlador WebSocket
   * @param {Object} realTimeService - Servicio para comunicaciones en tiempo real (Socket.IO)
   */
  constructor(realTimeService) {
    this.realTimeService = realTimeService;
  }

  /**
   * Inicializa el controlador con los eventos WebSocket necesarios
   */
  initialize() {
    if (!this.realTimeService || !this.realTimeService.io) {
      console.warn('No se puede inicializar WebSocketController: realTimeService no está listo');
      return;
    }

    // Configurar eventos WebSocket
    this._setupConnectionEvents();
    this._setupRoomEvents();
    this._setupOccupancyEvents();
    this._setupReservationEvents();

    console.log('WebSocketController inicializado correctamente');
  }

  /**
   * Configura los eventos de conexión y desconexión
   * @private
   */
  _setupConnectionEvents() {
    this.realTimeService.io.on('connection', (socket) => {
      console.log(`Cliente conectado: ${socket.id}`);

      // Evento para cuando un cliente se desconecta
      socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
      });

      // Evento para verificar estado de conexión (ping/pong)
      socket.on('ping', (callback) => {
        if (typeof callback === 'function') {
          callback({
            status: 'success',
            time: new Date(),
            socketId: socket.id
          });
        }
      });

      // Evento para registrar un usuario autenticado
      socket.on('register-user', (data) => {
        if (data && data.userId) {
          // Unir al usuario a su sala personal para notificaciones dirigidas
          socket.join(`user-${data.userId}`);
          console.log(`Usuario ${data.userId} registrado en WebSocket`);
          
          socket.emit('user-registered', {
            status: 'success',
            userId: data.userId,
            socketId: socket.id
          });
        }
      });
    });
  }

  /**
   * Configura los eventos relacionados con salas (aulas)
   * @private
   */
  _setupRoomEvents() {
    this.realTimeService.io.on('connection', (socket) => {
      // Evento para suscribirse a actualizaciones de un aula específica
      socket.on('join-classroom', (classroomId) => {
        if (!classroomId) return;
        
        const roomName = `classroom-${classroomId}`;
        socket.join(roomName);
        console.log(`Cliente ${socket.id} se unió a la sala ${roomName}`);
        
        socket.emit('joined-classroom', {
          status: 'success',
          classroomId,
          room: roomName
        });
      });

      // Evento para dejar de recibir actualizaciones de un aula
      socket.on('leave-classroom', (classroomId) => {
        if (!classroomId) return;
        
        const roomName = `classroom-${classroomId}`;
        socket.leave(roomName);
        console.log(`Cliente ${socket.id} dejó la sala ${roomName}`);
      });
    });
  }

  /**
   * Configura los eventos relacionados con la ocupación de aulas
   * @private
   */
  _setupOccupancyEvents() {
    this.realTimeService.io.on('connection', (socket) => {
      // Evento para suscribirse a actualizaciones de ocupación en tiempo real
      socket.on('subscribe-occupancy-updates', () => {
        socket.join('occupancy-updates');
        console.log(`Cliente ${socket.id} suscrito a actualizaciones de ocupación`);
      });

      // Evento para cancelar suscripción a actualizaciones de ocupación
      socket.on('unsubscribe-occupancy-updates', () => {
        socket.leave('occupancy-updates');
        console.log(`Cliente ${socket.id} canceló suscripción a actualizaciones de ocupación`);
      });
    });
  }

  /**
   * Configura los eventos relacionados con reservas
   * @private
   */
  _setupReservationEvents() {
    this.realTimeService.io.on('connection', (socket) => {
      // Evento para suscribirse a actualizaciones de reservas
      socket.on('subscribe-reservation-updates', (userId) => {
        if (userId) {
          socket.join(`reservation-updates-${userId}`);
          console.log(`Cliente ${socket.id} suscrito a actualizaciones de reservas para usuario ${userId}`);
        } else {
          socket.join('reservation-updates');
          console.log(`Cliente ${socket.id} suscrito a actualizaciones generales de reservas`);
        }
      });

      // Evento para cancelar suscripción a actualizaciones de reservas
      socket.on('unsubscribe-reservation-updates', (userId) => {
        if (userId) {
          socket.leave(`reservation-updates-${userId}`);
        } else {
          socket.leave('reservation-updates');
        }
      });
    });
  }

  /**
   * Notifica un cambio en la ocupación de un aula
   * @param {string} classroomId - ID del aula
   * @param {Object} occupancyData - Datos de ocupación
   */
  notifyOccupancyChange(classroomId, occupancyData) {
    if (!this.realTimeService) return;

    // Emitir a todos los suscriptores de actualizaciones de ocupación
    this.realTimeService.emitToRoom('occupancy-updates', 'occupancy-changed', {
      timestamp: new Date(),
      classroomId,
      ...occupancyData
    });

    // Emitir a la sala específica del aula
    this.realTimeService.emitToRoom(`classroom-${classroomId}`, 'classroom-occupancy-changed', {
      timestamp: new Date(),
      classroomId,
      ...occupancyData
    });
  }

  /**
   * Notifica un cambio en una reserva
   * @param {Object} reservationData - Datos de la reserva
   */
  notifyReservationChange(reservationData) {
    if (!this.realTimeService) return;

    // Emitir a todos los suscriptores de actualizaciones de reservas
    this.realTimeService.emitToRoom('reservation-updates', 'reservation-changed', {
      timestamp: new Date(),
      ...reservationData
    });

    // Si la reserva tiene un userId, notificar también a ese usuario específico
    if (reservationData.userId) {
      this.realTimeService.emitToUser(reservationData.userId, 'your-reservation-changed', {
        timestamp: new Date(),
        ...reservationData
      });
    }
  }

  /**
   * Notifica disponibilidad de aulas actualizada
   * @param {Array} classroomsData - Datos de disponibilidad de aulas
   */
  notifyAvailabilityUpdate(classroomsData) {
    if (!this.realTimeService) return;

    // Emitir a todos los clientes
    this.realTimeService.broadcast('availability-updated', {
      timestamp: new Date(),
      classrooms: classroomsData
    });
  }

  /**
   * Obtiene estadísticas del servicio WebSocket
   * @returns {Object} Estadísticas del servicio
   */
  getStats() {
    if (!this.realTimeService) {
      return { status: 'inactive', clientsCount: 0 };
    }
    
    return {
      status: 'active',
      ...this.realTimeService.getStats()
    };
  }
}

export default WebSocketController;
