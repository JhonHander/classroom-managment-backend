/**
 * UpdateAvailableClassroomsRealTimeUseCase.js
 * Caso de uso para actualizar y notificar cambios en la disponibilidad de aulas en tiempo real
 */

class UpdateAvailableClassroomsRealTimeUseCase {
//   /**
//    * Constructor
//    * @param {Object} classroomRepository - Repositorio para interactuar con aulas
//    * @param {Object} reservationRepository - Repositorio para interactuar con reservas
//    * @param {Object} webSocketController - Controlador WebSocket para notificaciones
//    */
//   constructor(classroomRepository, reservationRepository, webSocketController) {
//     this.classroomRepository = classroomRepository;
//     this.reservationRepository = reservationRepository;
//     this.webSocketController = webSocketController;
//   }

//   /**
//    * Actualiza la disponibilidad de las aulas y notifica a los clientes
//    * @param {Object} filters - Filtros opcionales (fecha, hora, capacidad, etc.)
//    * @returns {Promise<Array>} - Lista de aulas con su disponibilidad actualizada
//    */
//   async execute(filters = {}) {
//     try {
//       // 1. Obtener todas las aulas que coincidan con los filtros
//       const classrooms = await this.classroomRepository.findAvailable(filters);
      
//       // 2. Obtener reservas activas para el período de tiempo especificado
//       const { date, startTime, endTime } = filters;
//       const activeReservations = await this.reservationRepository.findActiveReservations({
//         date: date || new Date(),
//         startTime,
//         endTime
//       });
      
//       // 3. Cruzar la información para determinar disponibilidad
//       const availabilityData = classrooms.map(classroom => {
//         // Buscar si hay alguna reserva activa para esta aula
//         const hasActiveReservation = activeReservations.some(
//           reservation => reservation.classroomId === classroom.id
//         );
        
//         // Determinar disponibilidad
//         return {
//           id: classroom.id,
//           name: classroom.name,
//           fullName: classroom.fullName,
//           building: classroom.building,
//           floor: classroom.floor,
//           capacity: classroom.capacity,
//           features: classroom.features,
//           isAvailable: !hasActiveReservation && classroom.isActive,
//           currentStatus: hasActiveReservation ? 'reserved' : (classroom.isActive ? 'available' : 'inactive'),
//           // Incluir detalles de ocupación en tiempo real si están disponibles
//           occupancyDetails: classroom.occupancyDetails || null
//         };
//       });
      
//       // 4. Notificar la actualización a través de WebSockets
//       if (this.webSocketController) {
//         this.webSocketController.notifyAvailabilityUpdate(availabilityData);
//       }
      
//       return availabilityData;
//     } catch (error) {
//       console.error('Error updating available classrooms in real-time:', error);
//       throw error;
//     }
//   }

//   /**
//    * Actualiza la disponibilidad después de una nueva reserva
//    * @param {Object} reservation - La reserva creada
//    * @returns {Promise<void>}
//    */
//   async updateAfterReservation(reservation) {
//     try {
//       // Obtener el aula afectada
//       const classroom = await this.classroomRepository.findById(reservation.classroomId);
//       if (!classroom) {
//         throw new Error(`Aula con ID ${reservation.classroomId} no encontrada`);
//       }
      
//       // Notificar actualización específica para esta aula
//       const availabilityData = {
//         id: classroom.id,
//         name: classroom.name,
//         fullName: classroom.fullName,
//         isAvailable: false,
//         currentStatus: 'reserved',
//         reservation: {
//           id: reservation.id,
//           startTime: reservation.startTime,
//           endTime: reservation.endTime,
//           date: reservation.date
//         }
//       };
      
//       if (this.webSocketController) {
//         // Notificar a todos sobre el cambio de disponibilidad
//         this.webSocketController.notifyAvailabilityUpdate([availabilityData]);
        
//         // Notificar a los clientes suscritos a esta aula específica
//         this.webSocketController.notifyOccupancyChange(classroom.id, {
//           isAvailable: false,
//           status: 'reserved',
//           reason: 'reservation',
//           reservation: {
//             id: reservation.id,
//             startTime: reservation.startTime,
//             endTime: reservation.endTime
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Error updating availability after reservation:', error);
//       throw error;
//     }
//   }

//   /**
//    * Actualiza la disponibilidad después de cancelar una reserva
//    * @param {Object} reservation - La reserva cancelada
//    * @returns {Promise<void>}
//    */
//   async updateAfterCancellation(reservation) {
//     try {
//       // Obtener el aula afectada
//       const classroom = await this.classroomRepository.findById(reservation.classroomId);
//       if (!classroom) {
//         throw new Error(`Aula con ID ${reservation.classroomId} no encontrada`);
//       }
      
//       // Verificar si hay otras reservas activas para esta aula
//       const activeReservations = await this.reservationRepository.findActiveReservations({
//         classroomId: reservation.classroomId,
//         date: reservation.date,
//         startTime: reservation.startTime,
//         endTime: reservation.endTime
//       });
      
//       const isAvailable = activeReservations.length === 0 && classroom.isActive;
      
//       // Notificar actualización específica para esta aula
//       const availabilityData = {
//         id: classroom.id,
//         name: classroom.name,
//         fullName: classroom.fullName,
//         isAvailable,
//         currentStatus: isAvailable ? 'available' : 'reserved',
//         cancelledReservation: {
//           id: reservation.id
//         }
//       };
      
//       if (this.webSocketController) {
//         // Notificar a todos sobre el cambio de disponibilidad
//         this.webSocketController.notifyAvailabilityUpdate([availabilityData]);
        
//         // Notificar a los clientes suscritos a esta aula específica
//         this.webSocketController.notifyOccupancyChange(classroom.id, {
//           isAvailable,
//           status: isAvailable ? 'available' : 'reserved',
//           reason: 'cancellation'
//         });
//       }
//     } catch (error) {
//       console.error('Error updating availability after cancellation:', error);
//       throw error;
//     }
//   }

//   /**
//    * Actualiza la disponibilidad cuando cambia la ocupación en tiempo real
//    * @param {string} classroomId - ID del aula
//    * @param {Object} occupancyData - Datos de ocupación
//    * @returns {Promise<void>}
//    */
//   async updateAfterOccupancyChange(classroomId, occupancyData) {
//     try {
//       // Obtener el aula afectada
//       const classroom = await this.classroomRepository.findById(classroomId);
//       if (!classroom) {
//         throw new Error(`Aula con ID ${classroomId} no encontrada`);
//       }
      
//       // Obtener reservas activas para determinar si está reservada
//       const activeReservations = await this.reservationRepository.findActiveReservations({
//         classroomId,
//         date: new Date()
//       });
      
//       const hasReservation = activeReservations.length > 0;
      
//       // Determinar disponibilidad basada en ocupación y reservas
//       const isOccupied = occupancyData.isOccupied;
//       const isAvailable = !isOccupied && !hasReservation && classroom.isActive;
      
//       // Construir la información actualizada
//       const availabilityData = {
//         id: classroom.id,
//         name: classroom.name,
//         fullName: classroom.fullName,
//         isAvailable,
//         currentStatus: hasReservation ? 'reserved' : (isOccupied ? 'occupied' : 'available'),
//         occupancyDetails: {
//           isOccupied,
//           lastUpdated: occupancyData.lastUpdated || new Date(),
//           source: occupancyData.source || 'sensor',
//           confidence: occupancyData.confidence || 1.0
//         }
//       };
      
//       if (this.webSocketController) {
//         // Notificar a todos sobre el cambio de disponibilidad
//         this.webSocketController.notifyAvailabilityUpdate([availabilityData]);
//       }
//     } catch (error) {
//       console.error('Error updating availability after occupancy change:', error);
//       throw error;
//     }
//   }
}

export default UpdateAvailableClassroomsRealTimeUseCase;
