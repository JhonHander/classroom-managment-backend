/**
 * GetReservationByIdUseCase.js
 * Use case for retrieving a specific reservation by ID.
 */

class GetReservationByIdUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * Execute the use case to get a reservation by ID
     * @param {string|number} id - The ID of the reservation to retrieve
     * @returns {Promise<Object|null>} - The reservation object or null if not found
     */
    async execute(id) {
        return this.reservationRepository.findById(id);
    }
}

export default GetReservationByIdUseCase;