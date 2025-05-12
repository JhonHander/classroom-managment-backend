/**
 * Gets all reservations for a specific classroom
 */
class GetClassroomReservationsUseCase {
  constructor(reservationRepository, classroomRepository) {
    this.reservationRepository = reservationRepository;
    this.classroomRepository = classroomRepository;
  }

  async execute({ classroomId, fromDate, toDate, status }) {
    // Step 1: Validate classroom
    if (!classroomId) {
      throw new Error('Classroom ID is required');
    }

    const classroom = await this.classroomRepository.findById(classroomId);
    if (!classroom) {
      throw new Error(`Classroom with ID ${classroomId} not found`);
    }

    // Step 2: Prepare date filters
    if (!fromDate && !toDate) {
      // Default to current date if no dates provided
      const today = new Date();
      fromDate = today.toISOString().split('T')[0];
    }
    
    let dateFilter = {};
    if (fromDate) {
      dateFilter.from = new Date(fromDate);
    }
    if (toDate) {
      dateFilter.to = new Date(toDate);
    }

    // Step 3: Get reservations for classroom with optional filters
    const reservations = await this.reservationRepository.findByClassroom(
      classroomId, 
      { status, dateFilter }
    );

    return reservations;
  }
}

export default GetClassroomReservationsUseCase;