/**
 * Gets all sensors and their status
 * including the last reading and status (Online, Idle, Offline)
 * for each sensor.
 */
class GetAllSensorsUseCase {
  constructor(sensorRepository, classroomRepository) {
    this.sensorRepository = sensorRepository;
    this.classroomRepository = classroomRepository;
  }

  async execute({ classroomId, onlyActive = true, withLastReading = true }) {
    // Step 1: Apply filters based on parameters
    const filters = {};
    
    if (classroomId) {
      filters.classroomId = classroomId;
    }
    
    if (onlyActive) {
      filters.isActive = true;
    }

    // Step 2: Get sensors with filters
    const sensors = await this.sensorRepository.findAll(filters);
    
    // Step 3: If requested, get the last reading for each sensor
    if (withLastReading) {
      // For each sensor, get its last reading
      for (const sensor of sensors) {
        const lastReading = await this.sensorRepository.getLatestReading(null, sensor.id);
        sensor.lastReading = lastReading;
        
        // Calculate status based on last reading time
        if (lastReading) {
          const now = new Date();
          const lastReadingTime = new Date(lastReading.timestamp);
          const minutesDifference = (now - lastReadingTime) / (1000 * 60);
          
          if (minutesDifference <= 10) {
            sensor.status = 'Online';
          } else if (minutesDifference <= 60) {
            sensor.status = 'Idle';
          } else {
            sensor.status = 'Offline';
          }
        } else {
          sensor.status = 'Never Connected';
        }
      }
    }
    
    // Step 4: If a specific classroom was requested, get its details
    let classroom = null;
    if (classroomId) {
      classroom = await this.classroomRepository.findById(classroomId);
    }

    // Step 5: Return the results
    return {
      classroom,
      sensors,
      count: sensors.length,
      activeCount: sensors.filter(s => s.isActive).length,
      onlineCount: sensors.filter(s => s.status === 'Online').length
    };
  }
}

export default GetAllSensorsUseCase;