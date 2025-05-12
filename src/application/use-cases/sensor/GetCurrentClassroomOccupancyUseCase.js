class GetCurrentClassroomOccupancyUseCase {
  constructor(classroomRepository, timeSeriesDataService) {
    this.classroomRepository = classroomRepository;
    this.timeSeriesDataService = timeSeriesDataService;
  }

  async execute(classroomId) {
    // Step 1: Validate input
    if (!classroomId) {
      throw new Error('Classroom ID is required');
    }

    // Step 2: Check if classroom exists
    const classroom = await this.classroomRepository.findById(classroomId);
    if (!classroom) {
      throw new Error(`Classroom with ID ${classroomId} not found`);
    }

    // Step 3: Get the latest occupancy reading from the time series database
    const latestReading = await this.timeSeriesDataService.getLatestClassroomReading(classroomId, 'occupancy');
    
    // Step 4: Calculate occupancy percentage
    let occupancyPercentage = 0;
    let occupancyStatus = 'Empty';
    
    if (latestReading) {
      occupancyPercentage = (latestReading.value / classroom.capacity) * 100;
      
      // Determine status based on occupancy percentage
      if (occupancyPercentage === 0) {
        occupancyStatus = 'Empty';
      } else if (occupancyPercentage < 25) {
        occupancyStatus = 'Low';
      } else if (occupancyPercentage < 75) {
        occupancyStatus = 'Medium';
      } else if (occupancyPercentage < 90) {
        occupancyStatus = 'High';
      } else {
        occupancyStatus = 'Full';
      }
    }

    // Step 5: Return the occupancy status
    return {
      classroomId,
      classroomName: classroom.fullName,
      currentOccupancy: latestReading ? latestReading.value : 0,
      capacity: classroom.capacity,
      occupancyPercentage,
      occupancyStatus,
      lastUpdated: latestReading ? latestReading.time : null
    };
  }
}

export default GetCurrentClassroomOccupancyUseCase;