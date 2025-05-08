/**
 * GetReservationsByUserUseCase.js
 * Use case for retrieving all reservations for a specific user.
 */

class GetReservationsByUserUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * Execute the use case to get all reservations for a user
     * @param {string|number} userId - The ID of the user
     * @returns {Promise<Array>} - Array of reservations for the user
     */
    async execute(userId) {
        return this.reservationRepository.findByUserId(userId);
    }
}

export default GetReservationsByUserUseCase;