/**
 * GetReservationsByDateUseCase.js
 * Use case for retrieving all reservations for a specific date.
 */

class GetReservationsByDateUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * Execute the use case to get all reservations for a specific date
     * @param {string} date - The date in format YYYY-MM-DD
     * @returns {Promise<Array>} - Array of reservations for the date
     */
    async execute(date) {
        return this.reservationRepository.findByDate(date);
    }
}

export default GetReservationsByDateUseCase;