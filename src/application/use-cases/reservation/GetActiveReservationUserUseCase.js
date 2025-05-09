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
    async execute(email) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }
        console.log('email', email);
        console.log('user', user);
        return this.reservationRepository.findActiveByUserId(user.id);
    }
}

export default GetActiveReservationUserUseCase;