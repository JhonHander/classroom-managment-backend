class CreateClassroomUseCase {
  constructor(classroomRepository) {
    this.classroomRepository = classroomRepository;
  }

  async execute({ classroomType, block, classroomNumber, capacity, features = [] }) {
    // Step 1: Basic validation
    if (!classroomType || !block || !classroomNumber || !capacity) {
      throw new Error('Type, block, number and capacity are required for creating a classroom');
    }

    // Step 2: Create classroom full name
    const classroomFullName = `${block}-${classroomNumber}`;

    // Step 3: Check if classroom with the same full name already exists
    const existingClassroom = await this.classroomRepository.findByFullName(classroomFullName);
    if (existingClassroom) {
      throw new Error(`Classroom ${classroomFullName} already exists`);
    }

    // Step 4: Create the classroom entity
    const classroom = {
      classroomType,
      block,
      classroomNumber,
      classroomFullName,
      capacity
    };

    // Step 5: Save the classroom
    const createdClassroom = await this.classroomRepository.create(classroom);

    // Step 6: Add features if provided
    if (features && features.length > 0) {
      await this.classroomRepository.addFeaturesToClassroom(createdClassroom.id, features);
      // Reload classroom with features
      return await this.classroomRepository.findById(createdClassroom.id);
    }

    return createdClassroom;
  }
}

export default CreateClassroomUseCase;