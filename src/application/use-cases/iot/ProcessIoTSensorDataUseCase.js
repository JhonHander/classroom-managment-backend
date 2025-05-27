/**
 * ProcessIoTSensorDataUseCase.js
 * Caso de uso para procesar datos de sensores IoT y actualizar la ocupación de aulas
 */

import SensorReading from '../../../domain/entities/iot/SensorReading.js';

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
   * @param {number} data.occupancy - Indicador de ocupación (0 para no ocupado, 1 para ocupado)
   * @param {string} data.classroomFullName - Nombre completo del aula asociada
   * @param {Date} [data.timestamp] - Hora de la lectura (opcional, por defecto es ahora)
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async execute(data) {
    try {
      // Paso 1: Validar datos básicos del ESP32
      if (!data.sensorCode || data.occupancy === undefined || !data.classroomFullName) {
        throw new Error('El código del sensor, el nombre completo del aula y el valor de ocupación son obligatorios');
      }

      // Paso 2: Obtener el sensor asociado al código
      const sensor = await this.sensorRepository.findById(data.sensorCode);
      if (!sensor) {
        throw new Error(`Sensor con código ${data.sensorCode} no encontrado`);
      }

      // Paso 3: Verificar que el sensor está asociado a un aula
      if (!sensor.classroom || !sensor.classroom.id) {
        throw new Error(`El sensor con código ${data.sensorCode} no está asociado a ningún aula válida`);
      }

      // Paso 4: Obtener el aula asociada (usando el ID del sensor)
      const classroom = await this.classroomRepository.findById(sensor.classroom.id);
      if (!classroom) {
        throw new Error(`Aula con ID ${sensor.classroom.id} no encontrada (asociada al sensor ${data.sensorCode})`);
      }
      
      // Verificar si el classroomFullName coincide (opcional, pero buena práctica)
      if (classroom.fullName !== data.classroomFullName) {
        console.warn(`Advertencia: classroomFullName del payload (${data.classroomFullName}) no coincide con el de la BD (${classroom.fullName}) para el sensor ${data.sensorCode}. Se usará el de la BD.`);
      }

      // Paso 5: Normalizar datos
      const timestamp = new Date(data.timestamp);
      // const occupancyValue = parseInt(data.occupancy, 10);

      // Paso 7: Crear objeto de lectura del dominio
      const sensorReading = new SensorReading({
        sensorCode: data.sensorCode.toString(), // Asegurar que sea string si viene como número
        classroomFullName: classroom.fullName, // Usar el nombre del aula de la BD como fuente de verdad
        occupancy: data.occupancy,
        timestamp: timestamp
      });

      // Paso 8: Procesar la lectura a través del servicio IoT
      const occupancyStatus = await this.iotSensorService.processSensorReading(sensorReading, sensor.classroom.id);

      // Paso 11: Devolver resultado
      return {
        success: true,
        sensor: {
          id: sensor.id,
          classroomId: sensor.classroom.id,
          classroomFullName: classroom.fullName // Confirmado desde la BD
        },
        reading: {
          value: sensorReading.occupancy,
          timestamp: sensorReading.timestamp
        },
        occupancyStatus: {
          classroomId: occupancyStatus.classroomId, // Asegurar que esto lo devuelva el servicio IoT
          isOccupied: occupancyStatus.isOccupied,
          lastUpdated: occupancyStatus.lastUpdated
        }
      };
    } catch (error) {
      console.error('Error al procesar datos de sensor IoT:', error);
      throw error;
    }
  }
}

export default ProcessIoTSensorDataUseCase;
