class CreateClassroomFeatureUseCase {
  constructor(classroomRepository) {
    this.classroomRepository = classroomRepository;
  }

  async execute({ name, description }) {
    // Step 1: Basic validation
    if (!name) {
      throw new Error('Feature name is required');
    }

    // Step 2: Check if feature with the same name already exists
    const existingFeature = await this.classroomRepository.findFeatureByName(name);
    if (existingFeature) {
      throw new Error(`Feature with name "${name}" already exists`);
    }

    // Step 3: Create the feature
    const feature = {
      name,
      description: description || ''
    };

    // Step 4: Save the feature
    return await this.classroomRepository.createFeature(feature);
  }
}

export default CreateClassroomFeatureUseCase;