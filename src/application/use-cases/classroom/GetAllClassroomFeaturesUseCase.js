class GetAllClassroomFeaturesUseCase {
  constructor(classroomRepository) {
    this.classroomRepository = classroomRepository;
  }

  async execute() {
    // Retrieve all classroom features from the repository
    const features = await this.classroomRepository.getAllFeatures();
    
    if (!features || features.length === 0) {
      return [];
    }

    // Return the features sorted by name
    return features.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export default GetAllClassroomFeaturesUseCase;