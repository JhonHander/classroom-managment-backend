/**
 * UpdateReservationUseCase.js
 * Use case for updating a reservation's details or status.
 */

class UpdateReservationUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * Execute the use case to update a reservation
     * @param {Object} data - The data to update, including the reservation ID
     * @returns {Promise<Object|null>} - The updated reservation object or null if not found
     */
    async execute(data) {
        const { id, ...updateData } = data;
        
        // First check if the reservation exists
        const reservation = await this.reservationRepository.findById(id);
        if (!reservation) {
            return null;
        }
        
        // Update the reservation
        return this.reservationRepository.update(id, updateData);
    }
}

export default UpdateReservationUseCase;