/**
 * Updates classroom occupancy based on sensor data
 */
class UpdateClassroomOccupancyUseCase {
  constructor(sensorRepository, classroomRepository) {
    this.sensorRepository = sensorRepository;
    this.classroomRepository = classroomRepository;
  }

  async execute({ classroomId, sensorId, occupancyCount, timestamp = new Date() }) {
    // Step 1: Basic validation
    if (!classroomId || !sensorId || occupancyCount === undefined) {
      throw new Error('Classroom ID, sensor ID, and occupancy count are required');
    }

    // Step 2: Validate that the classroom exists
    const classroom = await this.classroomRepository.findById(classroomId);
    if (!classroom) {
      throw new Error(`Classroom with ID ${classroomId} not found`);
    }

    // Step 3: Validate that the sensor exists and is associated with the classroom
    const sensor = await this.sensorRepository.findById(sensorId);
    if (!sensor) {
      throw new Error(`Sensor with ID ${sensorId} not found`);
    }
    
    if (sensor.classroomId !== classroomId) {
      throw new Error(`Sensor ${sensorId} is not associated with classroom ${classroomId}`);
    }

    // Step 4: Validate occupancy count (can't be negative and shouldn't exceed capacity)
    if (occupancyCount < 0) {
      throw new Error('Occupancy count cannot be negative');
    }
    
    if (occupancyCount > classroom.capacity) {
      // Just log a warning but don't reject - sensors might detect more people than official capacity
      console.warn(`Warning: Reported occupancy (${occupancyCount}) exceeds classroom capacity (${classroom.capacity})`);
    }

    // Step 5: Record the sensor reading
    const sensorReading = {
      sensorId,
      classroomId,
      occupancyCount,
      timestamp
    };

    await this.sensorRepository.recordReading(sensorReading);

    // Step 6: Update the current occupancy status of the classroom
    await this.classroomRepository.updateOccupancyStatus(classroomId, occupancyCount);

    // Step 7: Return updated classroom status
    return {
      classroomId,
      fullName: classroom.fullName,
      currentOccupancy: occupancyCount,
      capacity: classroom.capacity,
      occupancyRate: (occupancyCount / classroom.capacity) * 100,
      timestamp
    };
  }
}

export default UpdateClassroomOccupancyUseCase;