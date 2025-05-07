class UpdateClassroomUseCase {
  constructor(classroomRepository) {
    this.classroomRepository = classroomRepository;
  }

  async execute({ id, classroomType, block, classroomNumber, capacity, features }) {
    // Step 1: Validate input
    if (!id) {
      throw new Error('Classroom ID is required');
    }

    // Step 2: Check if classroom exists
    const existingClassroom = await this.classroomRepository.findById(id);
    if (!existingClassroom) {
      throw new Error(`Classroom with ID ${id} not found`);
    }

    // Step 3: Build update object with only provided fields
    const updateData = {};
    if (classroomType !== undefined) updateData.classroomType = classroomType;
    if (block !== undefined) updateData.block = block;
    if (classroomNumber !== undefined) updateData.classroomNumber = classroomNumber;
    if (capacity !== undefined) updateData.capacity = capacity;
    
    // If both block and number are changed, update the full name
    if (block !== undefined && classroomNumber !== undefined) {
      updateData.classroomFullName = `${block}-${classroomNumber}`;
    } else if (block !== undefined) {
      updateData.classroomFullName = `${block}-${existingClassroom.number}`;
    } else if (classroomNumber !== undefined) {
      updateData.classroomFullName = `${existingClassroom.block}-${classroomNumber}`;
    }

    // Step 4: Update classroom
    const updatedClassroom = await this.classroomRepository.update(id, updateData);
    
    // Step 5: Update features if provided
    if (features !== undefined) {
      await this.classroomRepository.updateClassroomFeatures(id, features);
      // Reload classroom with updated features
      return await this.classroomRepository.findById(id);
    }

    return updatedClassroom;
  }
}

export default UpdateClassroomUseCase;