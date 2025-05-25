/**
 * GetRealTimeClassroomOccupancyUseCase.js
 * Caso de uso para obtener la ocupación en tiempo real de las aulas
 */

class GetRealTimeClassroomOccupancyUseCase {
  /**
   * Constructor
   * @param {Object} iotSensorService - Servicio para obtener datos de sensores IoT
   * @param {Object} classroomRepository - Repositorio para interactuar con aulas
   */
  constructor(iotSensorService, classroomRepository) {
    this.iotSensorService = iotSensorService;
    this.classroomRepository = classroomRepository;
  }

  /**
   * Obtiene el estado de ocupación de todas las aulas
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} - Lista de estados de ocupación
   */
  async execute(filters = {}) {
    try {
      // Obtener todas las aulas si se solicita información completa
      let classrooms = [];
      if (filters.includeClassroomInfo) {
        classrooms = await this.classroomRepository.findAll();
      }

      // Obtener datos de ocupación en tiempo real
      const occupancyData = await this.iotSensorService.getAllClassroomsOccupancy(filters);
      
      // Si no se solicita información completa, devolver solo los datos de ocupación
      if (!filters.includeClassroomInfo) {
        return occupancyData;
      }
      
      // Combinar datos de aulas con datos de ocupación
      return occupancyData.map(occupancy => {
        const classroom = classrooms.find(c => c.id === occupancy.classroomId);
        return {
          ...occupancy.toApiResponse(),
          classroom: classroom ? {
            id: classroom.id,
            name: classroom.name,
            fullName: classroom.fullName,
            capacity: classroom.capacity,
            building: classroom.building,
            floor: classroom.floor
          } : null
        };
      });
    } catch (error) {
      console.error('Error getting real-time occupancy:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de ocupación de un aula específica
   * @param {string} classroomId - ID del aula
   * @returns {Promise<Object>} - Estado de ocupación del aula
   */
  async getForClassroom(classroomId) {
    try {
      // Verificar que el aula existe
      const classroom = await this.classroomRepository.findById(classroomId);
      if (!classroom) {
        throw new Error(`Aula con ID ${classroomId} no encontrada`);
      }
      
      // Obtener datos de ocupación
      const occupancyStatus = await this.iotSensorService.getClassroomOccupancy(classroomId);
      
      // Combinar datos del aula con estado de ocupación
      return {
        ...occupancyStatus.toApiResponse(),
        classroom: {
          id: classroom.id,
          name: classroom.name,
          fullName: classroom.fullName,
          capacity: classroom.capacity,
          building: classroom.building,
          floor: classroom.floor
        }
      };
    } catch (error) {
      console.error(`Error getting occupancy for classroom ${classroomId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de ocupación de un aula
   * @param {string} classroomId - ID del aula
   * @param {Date} from - Fecha de inicio
   * @param {Date} to - Fecha de fin
   * @param {string} interval - Intervalo de tiempo para agregación
   * @returns {Promise<Array>} - Historial de ocupación
   */
  async getHistory(classroomId, from, to, interval) {
    try {
      // Verificar que el aula existe
      const classroom = await this.classroomRepository.findById(classroomId);
      if (!classroom) {
        throw new Error(`Aula con ID ${classroomId} no encontrada`);
      }
      
      // Obtener historial de ocupación
      const history = await this.iotSensorService.getOccupancyHistory(classroomId, from, to, interval);
      
      return {
        classroom: {
          id: classroom.id,
          name: classroom.name,
          fullName: classroom.fullName
        },
        history
      };
    } catch (error) {
      console.error(`Error getting history for classroom ${classroomId}:`, error);
      throw error;
    }
  }
}

export default GetRealTimeClassroomOccupancyUseCase;
