/**
 * SocketIOService.js
 * Servicio para gestionar comunicaciones en tiempo real con Socket.IO
 */

class SocketIOService {
  /**
   * Constructor
   * @param {Object} [server=null] - Servidor HTTP o Express para conectar Socket.IO (opcional)
   */
  constructor(server = null) {
    this.server = server;
    this.io = null;
    this.rooms = new Map(); // Para seguimiento de suscripciones a salas
    this.clients = new Map(); // Para seguimiento de clientes conectados
    
    // Inicialización diferida - Socket.IO se inicializará cuando se llame a init()
    console.log('Socket.IO service created, waiting for server to initialize');
  }
  /**
   * Inicializar el servicio con un servidor HTTP
   * @param {Object} httpServer - Servidor HTTP para conectar Socket.IO
   */
  async init(httpServer) {
    if (this.io) {
      console.log('Socket.IO already initialized');
      return;
    }

    try {
      // Importar Socket.IO dinámicamente usando ESM
      const { Server } = await import('socket.io');
      this.server = httpServer;
      this.io = new Server(httpServer, {
        cors: {
          origin: process.env.CLIENT_URL || '*',
          methods: ['GET', 'POST']
        }
      });

      // Configurar la gestión de conexiones
      this._setupConnectionHandlers();

      console.log('Socket.IO service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Socket.IO:', error);
      this.io = null;
    }
  }

  /**
   * Configurar los manejadores de eventos de conexión
   * @private
   */
  _setupConnectionHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`);
      
      // Registrar cliente
      this.clients.set(socket.id, {
        id: socket.id,
        userId: null,
        connectedAt: new Date(),
        rooms: []
      });

      // Manejar autenticación de usuario
      socket.on('authenticate', (data) => {
        if (data.userId) {
          // Actualizar cliente con ID de usuario
          const client = this.clients.get(socket.id);
          if (client) {
            client.userId = data.userId;
            this.clients.set(socket.id, client);
          }
          
          // Unir al usuario a su sala personal
          socket.join(`user-${data.userId}`);
          console.log(`User ${data.userId} authenticated on socket ${socket.id}`);
        }
      });

      // Manejar suscripción a sala de aula
      socket.on('join-classroom', (classroomId) => {
        if (!classroomId) return;
        
        const roomName = `classroom-${classroomId}`;
        socket.join(roomName);
        
        // Actualizar salas del cliente
        const client = this.clients.get(socket.id);
        if (client) {
          client.rooms.push(roomName);
          this.clients.set(socket.id, client);
        }
        
        console.log(`Client ${socket.id} joined room ${roomName}`);
      });

      // Manejar desuscripción de sala de aula
      socket.on('leave-classroom', (classroomId) => {
        if (!classroomId) return;
        
        const roomName = `classroom-${classroomId}`;
        socket.leave(roomName);
        
        // Actualizar salas del cliente
        const client = this.clients.get(socket.id);
        if (client) {
          client.rooms = client.rooms.filter(r => r !== roomName);
          this.clients.set(socket.id, client);
        }
        
        console.log(`Client ${socket.id} left room ${roomName}`);
      });

      // Manejar desconexión
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.clients.delete(socket.id);
      });
    });
  }
  /**
   * Emitir evento a todos los clientes conectados
   * @param {string} event - Nombre del evento
   * @param {any} data - Datos a enviar
   * @returns {boolean} - True si se emitió correctamente, false si no
   */
  broadcast(event, data) {
    if (!this.io) {
      console.warn(`Attempted to broadcast event "${event}" but Socket.IO is not initialized`);
      return false;
    }
    this.io.emit(event, data);
    return true;
  }

  /**
   * Emitir evento a una sala específica
   * @param {string} room - Nombre de la sala
   * @param {string} event - Nombre del evento
   * @param {any} data - Datos a enviar
   * @returns {boolean} - True si se emitió correctamente, false si no
   */
  emitToRoom(room, event, data) {
    if (!this.io) {
      console.warn(`Attempted to emit event "${event}" to room "${room}" but Socket.IO is not initialized`);
      return false;
    }
    this.io.to(room).emit(event, data);
    return true;
  }

  /**
   * Emitir evento a un usuario específico
   * @param {string} userId - ID del usuario
   * @param {string} event - Nombre del evento
   * @param {any} data - Datos a enviar
   * @returns {boolean} - True si se emitió correctamente, false si no
   */
  emitToUser(userId, event, data) {
    if (!this.io) {
      console.warn(`Attempted to emit event "${event}" to user "${userId}" but Socket.IO is not initialized`);
      return false;
    }
    this.io.to(`user-${userId}`).emit(event, data);
    return true;
  }

  /**
   * Obtener el número de clientes conectados a una sala
   * @param {string} room - Nombre de la sala
   * @returns {Promise<number>} - Número de clientes
   */
  async getClientsCountInRoom(room) {
    if (!this.io) return 0;
    const sockets = await this.io.in(room).fetchSockets();
    return sockets.length;
  }

  /**
   * Obtener estadísticas del servicio
   * @returns {Object} - Estadísticas
   */
  getStats() {
    return {
      clientsCount: this.clients.size,
      io: this.io ? 'active' : 'inactive',
      timestamp: new Date()
    };
  }
}

export default SocketIOService;
