class RegisterSensorUseCase {
  constructor(sensorRepository, classroomRepository) {
    this.sensorRepository = sensorRepository;
    this.classroomRepository = classroomRepository;
  }

  async execute({ sensorCode, sensorType, classroomId, description = null }) {
    // Step 1: Basic validation
    if (!sensorCode || !sensorType || !classroomId) {
      throw new Error('Sensor code, type, and classroom ID are required');
    }

    // Step 2: Check if classroom exists
    const classroom = await this.classroomRepository.findById(classroomId);
    if (!classroom) {
      throw new Error(`Classroom with ID ${classroomId} not found`);
    }

    // Step 3: Check if sensor code is already registered
    const existingSensor = await this.sensorRepository.findByCode(sensorCode);
    if (existingSensor) {
      throw new Error(`Sensor with code ${sensorCode} is already registered`);
    }

    // Step 4: Register the sensor
    const sensor = {
      sensorCode,
      sensorType,
      classroomId,
      description,
      status: 'active',
      lastActive: new Date()
    };

    // Step 5: Save the sensor
    const registeredSensor = await this.sensorRepository.create(sensor);

    // Step 6: Return the registered sensor with classroom info
    return {
      ...registeredSensor,
      classroom: {
        id: classroom.id,
        fullName: classroom.fullName
      }
    };
  }
}

export default RegisterSensorUseCase;