/**
 * GetReservationsByClassroomUseCase.js
 * Use case for retrieving all reservations for a specific classroom.
 */

class GetReservationsByClassroomUseCase {
    constructor(reservationRepository, classroomRepository) {
        this.reservationRepository = reservationRepository;
        this.classroomRepository = classroomRepository;
    }    /**
     * Execute the use case to get all reservations for a classroom
     * @param {string} classroomFullName - The full name of the classroom (e.g. "10-101")
     * @returns {Promise<Array>} - Array of reservations for the classroom
     */
    async execute(classroomFullName) {
        try {
            return await this.reservationRepository.findByClassroomFullName(classroomFullName);
        } catch (error) {
            console.error(`Error al buscar reservas para el aula ${classroomFullName}:`, error);
            return []; // En caso de error, devolvemos un array vacío
        }
    }


}

export default GetReservationsByClassroomUseCase;