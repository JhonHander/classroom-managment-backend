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
   * @param {string} data.classroomId - ID del aula asociada
   * @param {number} data.value - Valor de la lectura
   * @param {Date} data.timestamp - Marca de tiempo de la lectura
   */
  constructor(data) {
    this.sensorCode = data.sensorCode;
    this.classroomId = data.classroomId;
    this.value = data.value;
    this.timestamp = data.timestamp || new Date();
  }

  /**
   * Verifica si el aula está ocupada según esta lectura
   * @returns {boolean} - true si está ocupada, false en caso contrario
   */
  isClassroomOccupied() {
    // Para lecturas de tipo "occupancy", se considera ocupada si el valor es mayor a 0
      return this.value > 0;
  }

  /**
   * Obtiene un objeto plano con los datos para API
   * @returns {Object} - Datos para API
   */
  toApiResponse() {
    return {
      sensorCode: this.sensorCode,
      classroomId: this.classroomId,
      value: this.value,
      timestamp: this.timestamp,
      isOccupied: this.isClassroomOccupied()
    };
  }
}

export default SensorReading;
