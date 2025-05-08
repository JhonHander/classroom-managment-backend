import CreateReservationDTO from '../dtos/CreateReservationDTO.js';

class ReservationController {
  constructor(createReservationUseCase) {
    this.createReservationUseCase = createReservationUseCase;
  }

  /**
   * Handles the request to create a new reservation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createReservation(req, res) {
    try {
      // Extract and validate request data using DTO
      const validatedData = CreateReservationDTO.validate(req.body);
      
      // Execute the use case with validated data
      const reservation = await this.createReservationUseCase.execute(validatedData);
      
      // Send success response
      res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: {
          id: reservation.id,
          userId: reservation.userId,
          classroomId: reservation.classroomId,
          date: reservation.date,
          startHour: reservation.startHour,
          finishHour: reservation.finishHour,
          status: 'pending',
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
      console.error('Error creating reservation:', error);
      
      // Send appropriate error response
      res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || 'Failed to create reservation',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

export default ReservationController;