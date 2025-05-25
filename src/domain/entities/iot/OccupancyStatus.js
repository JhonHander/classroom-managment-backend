/**
 * OccupancyStatus.js
 * Entidad de dominio que representa el estado de ocupación de un aula
 */

class OccupancyStatus {
  constructor({
    classroomId,
    isOccupied,
    lastUpdated = new Date(),
    source = 'sensor',
    confidence = 1.0
  }) {
    this.classroomId = classroomId;   // ID del aula
    this.isOccupied = isOccupied;     // Estado de ocupación (true/false)
    this.lastUpdated = lastUpdated;   // Última actualización
    this.source = source;             // Fuente de la información ('sensor', 'schedule', 'manual')
    this.confidence = confidence;     // Nivel de confianza (0-1)
  }

  /**
   * Obtiene un objeto plano con los datos para API
   * @returns {Object} - Datos para API
   */
  toApiResponse() {
    return {
      classroomId: this.classroomId,
      status: this.isOccupied ? 'occupied' : 'available',
      isOccupied: this.isOccupied,
      lastUpdated: this.lastUpdated,
      source: this.source,
      confidence: this.confidence,
    };
  }
}

// Export both as default and named export to ensure compatibility
// export { OccupancyStatus };
export default OccupancyStatus;
