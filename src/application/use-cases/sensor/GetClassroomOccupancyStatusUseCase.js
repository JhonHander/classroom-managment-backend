/**
 * Gets the current occupancy status of a classroom
  * including the number of people currently in the classroom,
 */

class GetClassroomOccupancyStatusUseCase {
  constructor(sensorRepository, classroomRepository) {
    this.sensorRepository = sensorRepository;
    this.classroomRepository = classroomRepository;
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

    // Step 3: Get the latest sensor reading for the classroom
    const latestReading = await this.sensorRepository.getLatestReading(classroomId);
    
    // If no reading exists yet, return empty status
    if (!latestReading) {
      return {
        classroomId,
        fullName: classroom.fullName,
        currentOccupancy: 0,
        capacity: classroom.capacity,
        occupancyRate: 0,
        timestamp: null,
        status: 'Unknown',
        isOccupied: false
      };
    }

    // Step 4: Calculate occupancy rate and status
    const occupancyRate = (latestReading.occupancyCount / classroom.capacity) * 100;
    let status = 'Empty';
    let isOccupied = false;
    
    if (occupancyRate > 0) {
      isOccupied = true;
      if (occupancyRate < 25) {
        status = 'Low Occupancy';
      } else if (occupancyRate < 75) {
        status = 'Medium Occupancy';
      } else if (occupancyRate < 90) {
        status = 'High Occupancy';
      } else {
        status = 'Full';
      }
    }

    // Step 5: Return the occupancy status
    return {
      classroomId,
      fullName: classroom.fullName,
      currentOccupancy: latestReading.occupancyCount,
      capacity: classroom.capacity,
      occupancyRate,
      timestamp: latestReading.timestamp,
      status,
      isOccupied
    };
  }
}

export default GetClassroomOccupancyStatusUseCase;