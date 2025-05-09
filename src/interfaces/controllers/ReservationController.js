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
          status: reservation.reservationStatus?.name || 'pending',
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
      // Extract filter params from query
      const filters = {
        userId: req.query.userId,
        classroomFullName: req.query.classroomFullName,
        date: req.query.date,
        status: req.query.status
      };

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
  }

  /**
   * Get all reservations for a specific user
   * @param {Object} req - Express request object with user ID param
   * @param {Object} res - Express response object
   */
  async getReservationsByUserId(req, res) {
    try {
      const { email } = req.params;
      const reservations = await this.getReservationsByUserUseCase.execute(email);

      res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations
      });
    } catch (error) {
      console.error(`Error fetching reservations for user ${req.params.userId}:`, error);
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

      const updatedReservation = await this.updateReservationUseCase.execute({
        id,
        ...updateData
      });

      if (!updatedReservation) {
        return res.status(404).json({
          success: false,
          message: `Reservation with ID ${id} not found`
        });
      }

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
      const result = await this.cancelReservationUseCase.execute(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: `Reservation with ID ${id} not found`
        });
      }

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
      const { email } = req.path.params;
      const activeReservation = await this.getActiveReservationUseCase.execute(email);

      res.status(200).json({
        success: true,
        data: activeReservation || null,
        hasActiveReservation: !!activeReservation
      });
    } catch (error) {
      console.error(`Error fetching active reservation for user ${req.params.userId}:`, error);
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