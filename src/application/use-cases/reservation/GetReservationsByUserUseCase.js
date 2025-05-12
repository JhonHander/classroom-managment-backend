/**
 * GetReservationsByUserUseCase.js
 * Use case for retrieving all reservations for a specific user.
 */

class GetReservationsByUserUseCase {
    constructor(reservationRepository, userRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Execute the use case to get all reservations for a user
     * @param {string|number} userId - The ID of the user
     * @returns {Promise<Array>} - Array of reservations for the user
     */
    async execute(email) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }
        return this.reservationRepository.findByUserId(user.id);
    }
}

export default GetReservationsByUserUseCase;