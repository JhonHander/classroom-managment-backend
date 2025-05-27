/**
 * RealTimeOccupancyService.js
 * Implementación del servicio IoT para sensores de ocupación
 */
import IoTSensorService from '../../../application/ports/IoTSensorService.js';
import SensorReading from '../../../domain/entities/iot/SensorReading.js';
import OccupancyStatus from '../../../domain/entities/iot/OccupancyStatus.js'

class RealTimeOccupancyService extends IoTSensorService {
  /**
   * @param {Object} sensorRepository - Repositorio de sensores SQL
   * @param {Object} timeSeriesDataService - Servicio para datos de series temporales (InfluxDB)
   * @param {Object} realTimeService - Servicio para comunicación en tiempo real (WebSockets)
   */
  constructor(sensorRepository, timeSeriesDataService, realTimeService) {
    super();
    this.sensorRepository = sensorRepository;
    this.timeSeriesDataService = timeSeriesDataService;
    this.realTimeService = realTimeService;
    
    // Cache para estados de ocupación actuales
    this.occupancyCache = new Map();
  }

  /**
   * Procesa una lectura de sensor y actualiza el estado de ocupación
   * @param {SensorReading} sensorReading - Lectura del sensor (con classroomFullName, occupancy)
   * @param {string} classroomId - ID del aula (obtenido del sensor en la BD)
   * @returns {Promise<OccupancyStatus>} - Estado de ocupación actualizado
   */
  async processSensorReading(sensorReading, classroomId) {
    try {
      // 1. Guardar la lectura en InfluxDB
      await this.timeSeriesDataService.saveSensorReading({
        sensorCode: sensorReading.sensorCode,
        classroomId: classroomId, // Usar el classroomId proporcionado
        value: sensorReading.occupancy, // El valor ahora es occupancy
        timestamp: sensorReading.timestamp,
        type: 'occupancy' // Mantener 'type' para consistencia en InfluxDB si se usa para queries
      });
      
      // 2. Actualizar el estado del sensor en SQL si es necesario (ya usa sensorCode)
      // await this._updateSensorInSQL(sensorReading); // sensorReading tiene sensorCode
      
      // 3. Determinar el estado de ocupación (usando el método de la entidad SensorReading)
      const isOccupied = sensorReading.isClassroomOccupied();
      
      // 4. Crear objeto de estado de ocupación
      const occupancyStatus = new OccupancyStatus({
        classroomId: classroomId, // Usar el classroomId proporcionado
        isOccupied: isOccupied,
        lastUpdated: sensorReading.timestamp
        // source y confidence ya no son necesarios
      });
      
      // 5. Actualizar caché (usa classroomId)
      this.occupancyCache.set(classroomId, occupancyStatus);
      
      // 6. Notificar a los clientes en tiempo real (usa classroomId)
      this._notifyOccupancyChange(occupancyStatus);
      
      return occupancyStatus;
    } catch (error) {
      console.error('Error processing sensor reading:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de ocupación actual de un aula
   * @param {string} classroomId - ID del aula
   * @returns {Promise<OccupancyStatus>} - Estado de ocupación actual
   */
  async getClassroomOccupancy(classroomId) {
    // Comprobar primero en la caché
    if (this.occupancyCache.has(classroomId)) {
      return this.occupancyCache.get(classroomId);
    }
    
    try {
      // Si no está en caché, obtener la lectura más reciente de InfluxDB
      const latestReading = await this.timeSeriesDataService.getLatestClassroomReading(
        classroomId, 
        'occupancy' 
      );
      
      // Si no hay lecturas, devolver estado desconocido
      if (!latestReading) {
        return new OccupancyStatus({
          classroomId,
          isOccupied: false, // Por defecto no ocupada si no hay datos
          lastUpdated: new Date() // Usar fecha actual para lastUpdated
          // source: 'unknown', // Eliminado
          // confidence: 0 // Eliminado
        });
      }
      
      // Crear objeto de estado de ocupación
      // El campo de InfluxDB es `_value` o `value` dependiendo de la implementación de InfluxDBService
      // Asumimos que InfluxDBService devuelve un objeto con `value` y `timestamp`
      const occupancyValue = latestReading.value; // o latestReading._value
      const occupancyStatus = new OccupancyStatus({
        classroomId,
        isOccupied: occupancyValue > 0, // Basado en el valor numérico de la lectura
        lastUpdated: latestReading.timestamp
        // source: 'sensor', // Eliminado
        // confidence: 1.0 // Eliminado
      });
      
      // Actualizar caché
      this.occupancyCache.set(classroomId, occupancyStatus);
      
      return occupancyStatus;
    } catch (error) {
      console.error(`Error getting occupancy for classroom ${classroomId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de ocupación actual de todas las aulas
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array<OccupancyStatus>>} - Lista de estados de ocupación
   */
  async getAllClassroomsOccupancy(filters = {}) {
    try {
      // Obtener todos los sensores activos
      const sensors = await this.sensorRepository.findActiveSensors();
      
      // Mapear los IDs de aulas
      const classroomIds = sensors
        .filter(sensor => sensor.classroom && sensor.classroom.id)
        .map(sensor => sensor.classroom.id);
      
      // Obtener estado de ocupación para cada aula
      const occupancyPromises = classroomIds.map(id => this.getClassroomOccupancy(id));
      const occupancyResults = await Promise.all(occupancyPromises);
      
      // Aplicar filtros si es necesario
      let filteredResults = occupancyResults;
      
      if (filters.status === 'occupied') {
        filteredResults = filteredResults.filter(status => status.isOccupied);
      } else if (filters.status === 'available') {
        filteredResults = filteredResults.filter(status => !status.isOccupied);
      }
      
      return filteredResults;
    } catch (error) {
      console.error('Error getting all classrooms occupancy:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de ocupación de un aula
   * @param {string} classroomId - ID del aula
   * @param {Date} from - Fecha de inicio
   * @param {Date} to - Fecha de fin
   * @param {string} interval - Intervalo para agregación (ej: '5m')
   * @returns {Promise<Array>} - Historial de ocupación
   */
  async getOccupancyHistory(classroomId, from, to, interval = '5m') {
    try {
      // Obtener las lecturas históricas de InfluxDB
      const readings = await this.timeSeriesDataService.getClassroomReadings({
        classroomId,
        type: 'occupancy',
        from,
        to,
        interval,
        aggregation: 'mean'
      });
      
      // Transformar los datos para la API
      return readings.map(reading => ({
        timestamp: reading._time,
        value: reading._value,
        status: reading._value > 0 ? 'occupied' : 'available'
      }));
    } catch (error) {
      console.error(`Error getting occupancy history for classroom ${classroomId}:`, error);
      throw error;
    }
  }

  /**
   * Guarda una lectura de sensor en InfluxDB
   * @param {SensorReading} sensorReading - Lectura del sensor
   * @private
   */
  async _saveSensorReadingToInfluxDB(sensorReading) {
    // Este método parece redundante ahora que el guardado se hace en processSensorReading
    // y processSensorReading tiene el classroomId.
    // Lo comentaremos o eliminaremos si no se usa en otro lugar.
    /*
    await this.timeSeriesDataService.saveSensorReading({
      sensorCode: sensorReading.sensorCode,
      classroomId: sensorReading.classroomId, // ¡Este es el problema! sensorReading ya no tiene classroomId
      value: sensorReading.occupancy,
      timestamp: sensorReading.timestamp,
      type: 'occupancy'
    });
    */
    // Si se decide mantener, necesitaría el classroomId de alguna forma, 
    // por ejemplo, pasándolo como argumento o buscándolo con sensorRepository.
    // Por ahora, dado que el guardado se hace directamente en processSensorReading, este método no es llamado.
  }

  /**
   * Actualiza el estado del sensor en la base de datos SQL
   * @param {SensorReading} sensorReading - Lectura del sensor (tiene sensorCode y occupancy)
   * @private
   */
  async _updateSensorInSQL(sensorReading) {
    try {
      // Buscar sensor por código (sensorReading.sensorCode está disponible)
      const sensors = await this.sensorRepository.findBySensorCode(sensorReading.sensorCode);
      
      // Si no existe, no hay nada que actualizar en SQL
      if (!sensors || sensors.length === 0) {
        return;
      }
      
      // Usar el primer sensor encontrado
      const sensor = sensors[0];
      
      // Solo actualizar si el estado ha cambiado o pasó mucho tiempo desde la última actualización
      const isOccupied = sensorReading.isClassroomOccupied();
      const now = new Date();
      const lastUpdate = sensor.lastUpdated ? new Date(sensor.lastUpdated) : null;
      const timeSinceLastUpdate = lastUpdate ? now - lastUpdate : Infinity;
      
      // Actualizar cada 5 minutos o si cambia el estado
      if (sensor.isOccupied !== isOccupied || timeSinceLastUpdate > 5 * 60 * 1000) {
        sensor.status = 'active'; // Asegurar que esté activo
        sensor.lastUpdated = now;
        await this.sensorRepository.update(sensor);
      }
    } catch (error) {
      console.error('Error updating sensor in SQL:', error);
      // No propagamos el error para no interrumpir el flujo principal
    }
  }

  /**
   * Notifica a los clientes sobre un cambio en el estado de ocupación
   * @param {OccupancyStatus} occupancyStatus - Estado de ocupación
   * @private
   */
  _notifyOccupancyChange(occupancyStatus) {
    try { 
      // Emitir evento para todos los clientes
      this.realTimeService.broadcast('occupancy-changed', {
        timestamp: new Date(),
        ...occupancyStatus.toApiResponse()
      });
      
      // También emitir a una sala específica para este aula
      this.realTimeService.emitToRoom(`classroom-${occupancyStatus.classroomId}`, 'classroom-occupancy-changed', {
        timestamp: new Date(),
        ...occupancyStatus.toApiResponse()
      });
    } catch (error) {
      console.error('Error notifying occupancy change:', error);
    }
  }
}

export default RealTimeOccupancyService;
