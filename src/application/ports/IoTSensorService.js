/**
 * IoTSensorService.js
 * Interfaz para servicios de sensores IoT
 */

/**
 * Clase base para servicios IoT.
 * Implementa la lógica de integración con sensores IoT
 * y la gestión de los datos que envían.
 */
class IoTSensorService {
  /**
   * Procesa una lectura de sensor y actualiza los estados correspondientes
   * @param {Object} sensorReading - Lectura del sensor
   * @param {string} sensorReading.sensorCode - Código único del sensor
   * @param {string} sensorReading.classroomId - ID del aula asociada
   * @param {number} sensorReading.value - Valor de la lectura
   * @param {string} sensorReading.type - Tipo de lectura (ej: "occupancy", "temperature")
   * @param {Date} sensorReading.timestamp - Marca de tiempo de la lectura
   * @param {Function} sensorReading.isClassroomOccupied - Función que determina si el aula está ocupada según la lectura
   * @returns {Promise<Object>} - Estado de ocupación resultante
   */
  async processSensorReading(sensorReading) {
    throw new Error('Método no implementado');
  }

  /**
   * Obtiene el estado de ocupación actual de un aula
   * @param {string} classroomId - ID del aula
   * @returns {Promise<Object>} - Estado de ocupación actual
   */
  async getClassroomOccupancy(classroomId) {
    throw new Error('Método no implementado');
  }

  /**
   * Obtiene el estado de ocupación actual de todas las aulas
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} - Lista de estados de ocupación
   */
  async getAllClassroomsOccupancy(filters = {}) {
    throw new Error('Método no implementado');
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
    throw new Error('Método no implementado');
  }
}

export default IoTSensorService;
