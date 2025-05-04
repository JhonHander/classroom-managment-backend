class GetClassroomFeaturesUseCase {
  constructor(classroomRepository, scheduleRepository, sensorRepository) {
    this.classroomRepository = classroomRepository;
    this.scheduleRepository = scheduleRepository;
    this.sensorRepository = sensorRepository;
  }

  async execute(classroomId) {
    // Step 1: Validate input
    if (!classroomId) {
      throw new Error('Classroom ID is required');
    }

    // Step 2: Get classroom details
    const classroom = await this.classroomRepository.findById(classroomId);
    if (!classroom) {
      throw new Error(`Classroom with ID ${classroomId} not found`);
    }

    // Step 3: Get classroom schedule (if needed)
    const schedules = await this.scheduleRepository.findByClassroomId(classroomId);

    // Step 4: Get sensor status (if available)
    const sensors = await this.sensorRepository.findByClassroomId(classroomId);
    const sensorStatus = sensors.length > 0 ? sensors[0].status : 'unknown';

    // Step 5: Return combined information
    return {
      classroom,
      schedules,
      sensors,
      currentStatus: sensorStatus
    };
  }
}

export default GetClassroomFeaturesUseCase;