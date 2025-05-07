class CreateScheduleUseCase {
  constructor(scheduleRepository, classroomRepository, userRepository) {
    this.scheduleRepository = scheduleRepository;
    this.classroomRepository = classroomRepository;
    this.userRepository = userRepository;
  }

  async execute({ classroomId, dayOfWeek, startHour, endHour }) {
    // Step 1: Basic validation
    if (!classroomId || !dayOfWeek || !startHour || !endHour) {
      throw new Error('Classroom ID, user ID, day of week, start time, end time, and subject are required');
    }

    // Step 2: Validate time range
    if (startHour >= endHour) {
      throw new Error('Start hour must be before end hour');
    }

    // Step 3: Check if user exists and has permission to create schedules
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    if (user.role !== 1 && user.role !== 2) { // Admin or Teacher
      throw new Error('Only administrators and teachers can create classroom schedules');
    }

    // Step 4: Check if classroom exists
    const classroom = await this.classroomRepository.findById(classroomId);
    if (!classroom) {
      throw new Error(`Classroom with ID ${classroomId} not found`);
    }

    // Step 5: Check for scheduling conflicts
    const hasConflict = await this.scheduleRepository.checkTimeConflict(
      classroomId,
      dayOfWeek,
      startHour,
      endHour,
      null // No ID to exclude since this is a new schedule
    );

    if (hasConflict) {
      throw new Error(`Time conflict detected for classroom ${classroom.fullName} on ${dayOfWeek} from ${startHour} to ${endHour}`);
    }

    // Step 6: Create schedule
    const schedule = {
      classroomId,
      dayOfWeek,
      startHour,
      endHour,
    };

    // Step 7: Save the schedule
    const createdSchedule = await this.scheduleRepository.create(schedule);

    // Step 8: Return schedule with related data
    return {
      ...createdSchedule,
      user,
      classroom
    };
  }
}

export default CreateScheduleUseCase;