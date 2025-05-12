import CreateReservationDTO from '../dtos/CreateReservationDTO.js';

class ReservationController {
  constructor(
    createReservationUseCase,
    getAllReservationsUseCase,
    getReservationByIdUseCase,
    updateReservationUseCase,
    cancelReservationUseCase,
    getActiveReservationUseCase,
    getReservationsByUserUseCase,
    getReservationsByClassroomUseCase,
    getReservationsByDateUseCase,
  ) {
    this.createReservationUseCase = createReservationUseCase;
    this.getAllReservationsUseCase = getAllReservationsUseCase;
    this.getReservationByIdUseCase = getReservationByIdUseCase;
    this.updateReservationUseCase = updateReservationUseCase;
    this.cancelReservationUseCase = cancelReservationUseCase;
    this.getActiveReservationUseCase = getActiveReservationUseCase;
    this.getReservationsByUserUseCase = getReservationsByUserUseCase;
    this.getReservationsByClassroomUseCase = getReservationsByClassroomUseCase;
    this.getReservationsByDateUseCase = getReservationsByDateUseCase;
  }
  /**
   * Handles the request to create a new reservation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createReservation(req, res) {
    try {
      // Verificar permisos: solo el propio usuario o un admin pueden crear reservas para un usuario
      const requestingUserEmail = req.user.email;
      const requestingUserRole = req.user.role?.name;
      const targetUserEmail = req.body.email;
      
      // Si se está creando una reserva para otro usuario, verificar permisos
      if (targetUserEmail && targetUserEmail !== requestingUserEmail && requestingUserRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para crear reservas para otro usuario',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }
      
      // Usar toData en lugar de validate directamente
      // Esto valida y transforma los datos a la vez
      const reservationData = CreateReservationDTO.toData(req.body);
      
      // Execute the use case with validated and transformed data
      const reservation = await this.createReservationUseCase.execute(reservationData);
      
      // Send success response
      res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: {
          // id: reservation.id,
          email: reservation.user.email,
          classroomFullName: reservation.classroom.classroomFullName,
          date: reservation.date,
          startHour: reservation.startHour,
          finishHour: reservation.finishHour,
          status: reservation.reservationStatus?.name,
          classroom: reservation.classroom ? {
            id: reservation.classroom.id,
            fullName: reservation.classroom.fullName
          } : null,
          user: reservation.user ? {
            id: reservation.user.id,
            name: reservation.user.name,
            email: reservation.user.email
          } : null
        }
      });
    } catch (error) {
      console.error('[ReservationController] Error creating reservation:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create reservation',
      });
    }
  }
  /**
   * Get all reservations with optional filters
   * @param {Object} req - Express request object with optional query params
   * @param {Object} res - Express response object
   */
  async getAllReservations(req, res) {
    try {
      // Obtener rol e información del usuario desde el token
      const requestingUserId = req.user.id;
      const requestingUserRole = req.user.role?.name;
      
      // Extract filter params from query
      let filters = {
        userId: req.query.userId,
        classroomFullName: req.query.classroomFullName,
        date: req.query.date,
        status: req.query.status
      };
      
      // Si no es admin o profesor, solo puede ver sus propias reservas
      // ignorando cualquier userId en la consulta
      if (requestingUserRole !== 'admin' && requestingUserRole !== 'teacher') {
        // Sobreescribir el userId del filtro con el del usuario autenticado
        // independientemente de lo que haya pasado en la query
        filters.userId = requestingUserId;
        
        console.log(`Usuario con rol '${requestingUserRole}' solo puede ver sus propias reservas. Filtrando por userId=${requestingUserId}`);
      } else if (req.query.userId) {
        // Si es admin/profesor y específicamente filtró por userId, usamos ese filtro
        console.log(`Usuario con rol '${requestingUserRole}' solicitó filtrar por userId=${req.query.userId}`);
      } else {
        // Si es admin/profesor y no especificó userId, no filtramos por usuario (ver todas)
        console.log(`Usuario con rol '${requestingUserRole}' viendo todas las reservas`);
      }

      const reservations = await this.getAllReservationsUseCase.execute(filters);

      res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations
      });
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reservations',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  /**
   * Get a specific reservation by ID
   * @param {Object} req - Express request object with reservation ID param
   * @param {Object} res - Express response object
   */
  async getReservationById(req, res) {
    try {
      const { id } = req.params;
      const reservation = await this.getReservationByIdUseCase.execute(id);

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: `Reservation with ID ${id} not found`
        });
      }

      // Verificar si el usuario tiene permiso para ver esta reserva
      const requestingUserEmail = req.user.email;
      const requestingUserRole = req.user.role?.name;
      
      // Solo admins o el propio usuario pueden ver la reserva
      if (reservation.user.email !== requestingUserEmail && requestingUserRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver esta reserva'
        });
      }

      res.status(200).json({
        success: true,
        data: reservation
      });
    } catch (error) {
      console.error(`Error fetching reservation with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reservation',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }/**
   * Get all reservations for a specific user
   * @param {Object} req - Express request object with user ID param
   * @param {Object} res - Express response object
   */
  async getReservationsByUserEmail(req, res) {
    try {
      const { email } = req.params;
      const requestingUserEmail = req.user.email; // Email del usuario que hace la solicitud
      const requestingUserRole = req.user.role?.name; // Rol del usuario que hace la solicitud

      // Verificar si el usuario está intentando acceder a reservas de otro usuario
      // Solo admins o el propio usuario pueden ver las reservas
      if (email !== requestingUserEmail && requestingUserRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver las reservas de otro usuario'
        });
      }

      const reservations = await this.getReservationsByUserUseCase.execute(email);

      res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations
      });
    } catch (error) {
      console.error(`Error fetching reservations for user with email ${req.params.email}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user reservations',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  /**
   * Get all reservations for a specific classroom
   * @param {Object} req - Express request object with classroom fullName param
   * @param {Object} res - Express response object
   */
  async getReservationsByClassroom(req, res) {
    try {
      const { classroomFullName } = req.params;
      const requestingUserRole = req.user.role?.name;
      
      // Solo los administradores y profesores pueden acceder a todas las reservas de un aula sin restricciones
      // Los estudiantes solo deberían poder ver sus propias reservas para ese aula
      if (requestingUserRole !== 'admin' && requestingUserRole !== 'teacher') {
        // Filtrar para que los estudiantes solo vean sus propias reservas
        const userEmail = req.user.email;
        const allReservations = await this.getReservationsByClassroomUseCase.execute(classroomFullName);
        const userReservations = allReservations.filter(reservation => 
          reservation.user && reservation.user.email === userEmail
        );
        
        return res.status(200).json({
          success: true,
          count: userReservations.length,
          data: userReservations
        });
      }
      
      // Para admin y profesores, mostrar todas las reservas
      const reservations = await this.getReservationsByClassroomUseCase.execute(classroomFullName);

      res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations
      });
    } catch (error) {
      console.error(`Error fetching reservations for classroom ${req.params.classroomFullName}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch classroom reservations',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  /**
   * Update a reservation's status or details
   * @param {Object} req - Express request object with reservation ID param
   * @param {Object} res - Express response object
   */
  async updateReservation(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Primero, verifica si la reserva existe
      const existingReservation = await this.getReservationByIdUseCase.execute(id);
      
      if (!existingReservation) {
        return res.status(404).json({
          success: false,
          message: `Reservation with ID ${id} not found`
        });
      }

      // Verificar si el usuario tiene permiso para actualizar esta reserva
      const requestingUserEmail = req.user.email;
      const requestingUserRole = req.user.role?.name;
      
      // Solo admins, el propio usuario o profesores pueden actualizar la reserva
      const isAllowed = 
        existingReservation.user.email === requestingUserEmail ||
        requestingUserRole === 'admin' ||
        requestingUserRole === 'teacher';
        
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para actualizar esta reserva'
        });
      }

      const updatedReservation = await this.updateReservationUseCase.execute({
        id,
        ...updateData
      });

      res.status(200).json({
        success: true,
        message: 'Reservation updated successfully',
        data: updatedReservation
      });
    } catch (error) {
      console.error(`Error updating reservation with ID ${req.params.id}:`, error);
      res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || 'Failed to update reservation',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  /**
   * Cancel/delete a reservation
   * @param {Object} req - Express request object with reservation ID param
   * @param {Object} res - Express response object
   */
  async cancelReservation(req, res) {
    try {
      const { id } = req.params;
      
      // Primero, verifica si la reserva existe
      const existingReservation = await this.getReservationByIdUseCase.execute(id);
      
      if (!existingReservation) {
        return res.status(404).json({
          success: false,
          message: `Reservation with ID ${id} not found`
        });
      }

      // Verificar si el usuario tiene permiso para cancelar esta reserva
      const requestingUserEmail = req.user.email;
      const requestingUserRole = req.user.role?.name;
      
      // Solo admins, el propio usuario o profesores pueden cancelar la reserva
      const isAllowed = 
        existingReservation.user.email === requestingUserEmail ||
        requestingUserRole === 'admin' ||
        requestingUserRole === 'teacher';
        
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para cancelar esta reserva'
        });
      }

      const result = await this.cancelReservationUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Reservation cancelled successfully'
      });
    } catch (error) {
      console.error(`Error cancelling reservation with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel reservation',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  /**
   * Get active reservation for a specific user
   * @param {Object} req - Express request object with user email param
   * @param {Object} res - Express response object
   */
  async getActiveReservationByUser(req, res) {
    try {
      const { email } = req.params;
      const requestingUserEmail = req.user.email; // Email del usuario que hace la solicitud
      const requestingUserRole = req.user.role?.name; // Rol del usuario que hace la solicitud

      // Verificar si el usuario está intentando acceder a reservas activas de otro usuario
      // Solo admins o el propio usuario pueden ver las reservas activas
      if (email !== requestingUserEmail && requestingUserRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver las reservas activas de otro usuario'
        });
      }

      const activeReservation = await this.getActiveReservationUseCase.execute(email);

      res.status(200).json({
        success: true,
        data: activeReservation,
        hasActiveReservation: !!activeReservation
      });
    } catch (error) {
      console.error(`Error fetching active reservation for user ${req.params.email}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active reservation',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get all reservations for a specific date
   * @param {Object} req - Express request object with date param
   * @param {Object} res - Express response object
   */
  async getReservationsByDate(req, res) {
    try {
      const { date } = req.params;
      const reservations = await this.getReservationsByDateUseCase.execute(date);

      res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations
      });
    } catch (error) {
      console.error(`Error fetching reservations for date ${req.params.date}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reservations by date',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

export default ReservationController;