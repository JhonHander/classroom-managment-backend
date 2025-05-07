class GetAllClassroomsUseCase {
  constructor(classroomRepository) {
    this.classroomRepository = classroomRepository;
  }

  async execute({ type, block, withFeatures = true }) {
    // Retrieve all classrooms with optional filtering
    const classrooms = await this.classroomRepository.findAll({ type, block, withFeatures });
    
    if (!classrooms || classrooms.length === 0) {
      return [];
    }

    // Return classrooms sorted by block and number
    return classrooms.sort((a, b) => {
      if (a.block === b.block) {
        return a.number - b.number;
      }
      return a.block.localeCompare(b.block);
    });
  }
}

export default GetAllClassroomsUseCase;