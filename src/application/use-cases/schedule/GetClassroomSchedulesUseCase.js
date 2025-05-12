/**
 *  Retrieves schedules for classrooms based on optional filters such as classroom ID and day of the week.
 */
class GetClassroomSchedulesUseCase {
  constructor(scheduleRepository, classroomRepository) {
    this.scheduleRepository = scheduleRepository;
    this.classroomRepository = classroomRepository;
  }

  async execute({ classroomId, dayOfWeek }) {
    // Step 1: Validate classroom if ID is provided
    if (classroomId) {
      const classroom = await this.classroomRepository.findById(classroomId);
      if (!classroom) {
        throw new Error(`Classroom with ID ${classroomId} not found`);
      }
    }

    // Step 2: Fetch schedules with optional filters
    const schedules = await this.scheduleRepository.findAll({
      classroomId: classroomId,
      dayOfWeek: dayOfWeek
    });

    return schedules;
  }
}

export default GetClassroomSchedulesUseCase;