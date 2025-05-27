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
   * @param {SensorReading} sensorReading - Lectura del sensor
   * @returns {Promise<OccupancyStatus>} - Estado de ocupación actualizado
   */
  async processSensorReading(sensorReading) {
    try {
      console.log('🔍 Recibiendo datos del sensor:', {
        sensorCode: sensorReading.sensorCode,
        classroomId: sensorReading.classroomId,
        value: sensorReading.value,
        timestamp: sensorReading.timestamp
      });

      // 1. Guardar la lectura en InfluxDB
      await this._saveSensorReadingToInfluxDB(sensorReading);
      console.log('✅ Datos guardados en InfluxDB');
      
      // 2. Determinar el estado de ocupación
      const isOccupied = sensorReading.isClassroomOccupied();
      console.log(`🎯 Estado de ocupación: ${isOccupied ? 'Ocupado' : 'Desocupado'}`);
      
      // 3. Crear objeto de estado de ocupación
      const occupancyStatus = new OccupancyStatus({
        classroomId: sensorReading.classroomId,
        isOccupied: isOccupied,
        lastUpdated: sensorReading.timestamp,
        source: 'sensor',
        confidence: 1.0
      });
      
      // 4. Actualizar caché
      this.occupancyCache.set(sensorReading.classroomId, occupancyStatus);
      
      // 5. Notificar a los clientes en tiempo real
      this._notifyOccupancyChange(occupancyStatus);
      console.log('📢 Notificación enviada a clientes en tiempo real');
      
      return occupancyStatus;
    } catch (error) {
      console.error('❌ Error procesando datos del sensor:', error);
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
          isOccupied: false,
          source: 'unknown',
          confidence: 0
        });
      }
      
      // Crear objeto de estado de ocupación
      const occupancyStatus = new OccupancyStatus({
        classroomId,
        isOccupied: latestReading.value > 0,
        lastUpdated: latestReading.timestamp,
        source: 'sensor',
        confidence: 1.0
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
    try {
      console.log('📊 Guardando datos en InfluxDB:', {
        sensorCode: sensorReading.sensorCode,
        classroomId: sensorReading.classroomId,
        value: sensorReading.value,
        timestamp: sensorReading.timestamp
      });

      await this.timeSeriesDataService.saveSensorReading({
        sensorCode: sensorReading.sensorCode,
        classroomId: sensorReading.classroomId,
        value: sensorReading.value,
        timestamp: sensorReading.timestamp
      });

      console.log('✅ Datos guardados exitosamente en InfluxDB');
    } catch (error) {
      console.error('❌ Error guardando datos en InfluxDB:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado del sensor en la base de datos SQL
   * @param {SensorReading} sensorReading - Lectura del sensor
   * @private
   */
  async _updateSensorInSQL(sensorReading) {
    try {
      // Buscar sensor por código
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
