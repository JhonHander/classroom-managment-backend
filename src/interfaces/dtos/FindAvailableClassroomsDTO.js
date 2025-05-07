/**
 * Data Transfer Object for displaying available classrooms
 * Used to shape and validate the data returned to the frontend
 */
export class AvailableClassroomDTO {
  constructor(data) {
    
    this.fullName = data.fullName;
    this.capacity = data.capacity;
    this.type = data.type;
    this.block = data.block;
    this.sensorStatus = data.sensorStatus || 'activo'; // default if missing
  }

  /**
   * Validates the DTO data
   * @returns {Object} Object with isValid and errors properties
   */
  validate() {
    const errors = [];

   

    if (!this.fullName || typeof this.fullName !== 'string') {
      errors.push('Full name is required');
    }

    if (typeof this.capacity !== 'number' || this.capacity < 1) {
      errors.push('Invalid capacity');
    }

    if (!this.type || typeof this.type !== 'string') {
      errors.push('Classroom type is required');
    }

    if (!this.block || typeof this.block !== 'string') {
      errors.push('Block is required');
    }

    if (!['activo', 'inactivo', 'mantenimiento'].includes(this.sensorStatus)) {
      errors.push('Invalid sensor status');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Returns a sanitized version of the DTO data
   * @returns {Object} Sanitized data
   */
  toData() {
    return {
      
      fullName: (this.fullName ?? '').toString().trim(),
      capacity: this.capacity,
      type: this.type.trim(),
      block: this.block.trim(),
      sensorStatus: this.sensorStatus
    };
  }
}
