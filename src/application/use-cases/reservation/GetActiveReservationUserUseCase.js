/**
 * GetActiveReservationUseCase.js
 * Use case for retrieving the active reservation for a user.
 */

class GetActiveReservationUserUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * Execute the use case to get the active reservation for a user
     * @param {string|number} userId - The ID of the user
     * @returns {Promise<Object|null>} - The active reservation or null if none exists
     */
    async execute(userId) {
        return this.reservationRepository.findActiveByUserId(userId);
    }
}

export default GetActiveReservationUserUseCase;