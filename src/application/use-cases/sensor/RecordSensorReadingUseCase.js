class RecordSensorReadingUseCase {
  constructor(sensorRepository, classroomRepository, timeSeriesDataService) {
    this.sensorRepository = sensorRepository;
    this.classroomRepository = classroomRepository;
    this.timeSeriesDataService = timeSeriesDataService;
  }

  async execute({ sensorCode, value, type = 'occupancy', timestamp = new Date() }) {
    // Step 1: Basic validation
    if (!sensorCode || value === undefined) {
      throw new Error('Sensor code and reading value are required');
    }

    // Step 2: Check if sensor exists
    const sensor = await this.sensorRepository.findByCode(sensorCode);
    if (!sensor) {
      throw new Error(`Sensor with code ${sensorCode} not found`);
    }

    // Step 3: Update sensor's last active timestamp
    await this.sensorRepository.updateLastActive(sensor.id, timestamp);

    // Step 4: Save reading to time series database
    const reading = {
      sensorCode,
      classroomId: sensor.classroomId,
      value,
      type,
      timestamp
    };

    await this.timeSeriesDataService.saveSensorReading(reading);

    // Step 5: Return success with sensor info
    return {
      success: true,
      sensor: {
        id: sensor.id,
        code: sensor.code,
        type: sensor.type,
        classroomId: sensor.classroomId
      },
      reading: {
        value,
        type,
        timestamp
      }
    };
  }
}

export default RecordSensorReadingUseCase;