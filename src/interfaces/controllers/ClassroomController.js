import { AvailableClassroomDTO } from '../dtos/FindAvailableClassroomsDTO.js';

class ClassroomController {
  constructor(getAvailableClassroomsUseCase) {
    this.getAvailableClassroomsUseCase = getAvailableClassroomsUseCase;
  }

  /**
   * Get available classrooms based on date and time
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAvailableClassrooms(req, res) {
    try {
      const { date, startHour, endHour } = req.query;
      console.log('[DEBUG] query:', req.query);

      if (!date || !startHour || !endHour) {
        return res.status(400).json({
          success: false,
          message: 'Missing required query parameters: date, startHour, endHour'
        });
      }

      const classrooms = await this.getAvailableClassroomsUseCase.execute({
        date,
        startHour: startHour,
        endHour: endHour
      });

      const response = classrooms.map(c => {
        const dto = new AvailableClassroomDTO({
          id: c.id,
          fullName: c.fullName,
          capacity: c.capacity,
          block: c.block,
          type: c.type.name
        });
        return dto.toData();
      });

      return res.status(200).json({
        success: true,
        message: 'Available classrooms retrieved successfully',
        data: response
      });

    } catch (error) {
      console.error('Error retrieving available classrooms:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve available classrooms',
        error: error.message
      });
    }
  }
}

export default ClassroomController;
