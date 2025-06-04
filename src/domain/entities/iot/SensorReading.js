/**
 * SensorReading.js
 * Entidad de dominio que representa una lectura de sensor
 */

class SensorReading {
  /**
   * Constructor
   * 
   * @param {Object} data - Datos de la lectura
   * @param {string} data.sensorCode - Código único del sensor
   * @param {string} data.classroomFullName - Nombre completo del aula asociada
   * @param {number} data.occupancy - Valor de la lectura de ocupación (0 o 1)
   * @param {Date | string} [data.timestamp] - Marca de tiempo de la lectura
   */
  constructor(data) {
    this.sensorCode = data.sensorCode;
    this.classroomFullName = data.classroomFullName;
    this.occupancy = data.occupancy;
    this.timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
  }

  /**
   * Verifica si el aula está ocupada según esta lectura
   * @returns {boolean} - true si está ocupada, false en caso contrario
   */
  isClassroomOccupied() {
    // Se considera ocupada si el valor de occupancy es 1 (o mayor que 0)
    return this.occupancy > 0;
  }

  /**
   * Obtiene un objeto plano con los datos para API
   * @returns {Object} - Datos para API
   */
  toApiResponse() {
    return {
      sensorCode: this.sensorCode,
      classroomFullName: this.classroomFullName,
      occupancy: this.occupancy,
      timestamp: this.timestamp,
      isOccupied: this.isClassroomOccupied()
    };
  }
}

export default SensorReading;
