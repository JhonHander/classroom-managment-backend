// /**
//  * Data Transfer Object for creating a reservation
//  * Used to shape and validate the input data from the frontend
//  */
// export class CreateReservationDTO {
//     constructor(data) {
//       this.userId = data.userId;
//       this.classroomId = data.classroomId;
//       this.date = data.date;
//       this.startHour = data.startHour;
//       this.finishHour = data.finishHour;
//     }
  
//     /**
//      * Validates the DTO data
//      * @returns {Object} Object with isValid and errors properties
//      */
//     validate() {
//       const errors = [];
  
//       if (!Number.isInteger(this.userId) || this.userId <= 0) {
//         errors.push('Invalid or missing userId');
//       }
  
//       if (!Number.isInteger(this.classroomId) || this.classroomId <= 0) {
//         errors.push('Invalid or missing classroomId');
//       }
  
//       if (!this.date || !/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
//         errors.push('Invalid or missing date (expected format YYYY-MM-DD)');
//       }
  
//       if (!this.startHour || !/^\d{2}:\d{2}$/.test(this.startHour)) {
//         errors.push('Invalid or missing startHour (expected format HH:mm)');
//       }
  
//       if (!this.finishHour || !/^\d{2}:\d{2}$/.test(this.finishHour)) {
//         errors.push('Invalid or missing finishHour (expected format HH:mm)');
//       }
  
//       // Validar que startHour < finishHour si ambas son válidas
//       if (
//         /^\d{2}:\d{2}$/.test(this.startHour) &&
  