class GetClassroomByIdUseCase {
  constructor(classroomRepository) {
    this.classroomRepository = classroomRepository;
  }

  async execute(classroomId) {
    // Step 1: Validate input
    if (!classroomId) {
      throw new Error('Classroom ID is required');
    }

    // Step 2: Get classroom details with features
    const classroom = await this.classroomRepository.findById(classroomId);
    
    if (!classroom) {
      throw new Error(`Classroom with ID ${classroomId} not found`);
    }

    return classroom;
  }
}

export default GetClassroomByIdUseCase;