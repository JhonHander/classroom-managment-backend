/**
 * CancelReservationUseCase.js
 * Use case for cancelling a reservation.
 */

class CancelReservationUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * Execute the use case to cancel a reservation
     * @param {string|number} id - The ID of the reservation to cancel
     * @returns {Promise<boolean>} - True if cancelled successfully, false if not found
     */
    async execute(id) {
        // First check if the reservation exists
        const reservation = await this.reservationRepository.findById(id);
        if (!reservation) {
            return false;
        }
        
        // Update the reservation status to cancelled (assuming status ID 4 is 'cancelled')
        await this.reservationRepository.update(id, { reservationStatusId: 4 });
        return true;
    }
}

export default CancelReservationUseCase;