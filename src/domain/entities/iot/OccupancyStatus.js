/**
 * OccupancyStatus.js
 * Entidad de dominio que representa el estado de ocupación de un aula
 */

class OccupancyStatus {
  constructor({
    classroomId,
    isOccupied,
    lastUpdated
  }) {
    this.classroomId = classroomId;   // ID del aula
    this.isOccupied = isOccupied;     // Estado de ocupación (true/false)
    this.lastUpdated = lastUpdated;   // Última actualización
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
      lastUpdated: this.lastUpdated
    };
  }
}

// Export both as default and named export to ensure compatibility
// export { OccupancyStatus };
export default OccupancyStatus;
