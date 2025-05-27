/**
 * ProcessIoTSensorDataUseCase.js
 * Caso de uso para procesar datos de sensores IoT y actualizar la ocupación de aulas
 */

class ProcessIoTSensorDataUseCase {
  /**
   * Constructor
   * 
   * @param {Object} sensorRepository - Repositorio para la persistencia de sensores
   * @param {Object} classroomRepository - Repositorio para interactuar con aulas
   * @param {Object} timeSeriesDataService - Servicio para almacenar datos de series temporales (InfluxDB)
   * @param {Object} iotSensorService - Servicio para la gestión de sensores IoT
   */
  constructor(sensorRepository, classroomRepository, timeSeriesDataService, iotSensorService) {
    this.sensorRepository = sensorRepository;
    this.classroomRepository = classroomRepository;
    this.timeSeriesDataService = timeSeriesDataService;
    this.iotSensorService = iotSensorService;
  }

  /**
   * Procesa los datos recibidos de un sensor
   * 
   * @param {Object} data - Datos del sensor
   * @param {string} data.sensorCode - Código del sensor
   * @param {number} data.value - Valor de la lectura (ej: número de personas)
   * @param {string} data.type - Tipo de lectura (ej: "occupancy", "temperature")
   * @param {Date} [data.timestamp] - Hora de la lectura (opcional, por defecto es ahora)
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async execute(data) {
    try {
      // Paso 1: Validar datos básicos
      if (!data.sensorCode || data.value === undefined) {
        throw new Error('El código del sensor y el valor son obligatorios');
      }

      // Paso 2: Obtener el sensor asociado al código
      const sensor = await this.sensorRepository.findById(data.sensorCode);
      if (!sensor) {
        throw new Error(`Sensor con código ${data.sensorCode} no encontrado`);
      }

      // Paso 3: Verificar que el sensor está asociado a un aula
      if (!sensor.classroomId) {
        throw new Error(`El sensor con código ${data.sensorCode} no está asociado a ningún aula`);
      }

      // Paso 4: Obtener el aula asociada
      const classroom = await this.classroomRepository.findById(sensor.classroomId);
      if (!classroom) {
        throw new Error(`Aula con ID ${sensor.classroomId} no encontrada`);
      }      // Paso 5: Normalizar datos
      const timestamp = data.timestamp || new Date();
      const type = data.type || 'occupancy';
      const value = parseInt(data.value, 10);

      // Paso 6: Crear objeto de lectura
      const sensorReading = {
        sensorCode: data.sensorCode,
        classroomId: sensor.classroomId,
        value,
        type,
        timestamp,
        isClassroomOccupied: () => value > 0
      };      // Paso 8: Procesar la lectura a través del servicio IoT
      const occupancyStatus = await this.iotSensorService.processSensorReading(sensorReading);

      // Paso 9: Comentado temporalmente el guardado en InfluxDB
      /*await this.timeSeriesDataService.saveSensorReading({
        sensorCode: data.sensorCode, 
        classroomId: sensor.classroomId, 
        value,
        type,
        timestamp
      });*/

      // Paso 10: Actualizar el estado de ocupación del aula en la base de datos relacional
      if (type === 'occupancy') {
        await this.classroomRepository.updateOccupancyStatus(sensor.classroomId, value);
      }

      // Paso 11: Devolver resultado
      return {
        success: true,
        sensor: {
          id: sensor.id,
          code: sensor.sensorCode,
          type: sensor.type,
          classroomId: sensor.classroomId,
          classroomName: classroom.fullName
        },
        reading: {
          value,
          type,
          timestamp
        },
        occupancyStatus: {
          isOccupied: occupancyStatus.isOccupied,
          lastUpdated: occupancyStatus.lastUpdated,
          source: occupancyStatus.source,
          confidence: occupancyStatus.confidence
        }
      };
    } catch (error) {
      console.error('Error al procesar datos de sensor IoT:', error);
      throw error;
    }
  }
}

export default ProcessIoTSensorDataUseCase;
