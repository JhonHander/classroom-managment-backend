/**
 * GetReservationsByClassroomUseCase.js
 * Use case for retrieving all reservations for a specific classroom.
 */

class GetReservationsByClassroomUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * Execute the use case to get all reservations for a classroom
     * @param {string|number} classroomId - The ID of the classroom
     * @returns {Promise<Array>} - Array of reservations for the classroom
     */
    async execute(classroomId) {
        return this.reservationRepository.findByClassroomId(classroomId);
    }
}

export default GetReservationsByClassroomUseCase;