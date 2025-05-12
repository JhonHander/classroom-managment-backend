/**
 * GetAllReservationsUseCase.js
 * Use case for retrieving all reservations with optional filters.
 */

class GetAllReservationsUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * Execute the use case to get all reservations with optional filters
     * @param {Object} filters - Optional filters (userId, classroomFullName, date, status)
     * @returns {Promise<Array>} - Array of reservations matching the filters
     */
    async execute(filters = {}) {
        return this.reservationRepository.findAll(filters);
    }
}

export default GetAllReservationsUseCase;