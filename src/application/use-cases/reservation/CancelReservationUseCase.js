/** 
  *Cancels an existing reservation
*/

class CancelReservationUseCase {
  constructor(reservationRepository, notificationService) {
    this.reservationRepository = reservationRepository;
    this.notificationService = notificationService;
  }

  async execute({ reservationId, userId, reason = null }) {
    // Step 1: Validate input
    if (!reservationId || !userId) {
      throw new Error('Reservation ID and user ID are required');
    }

    // Step 2: Find the reservation
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }

    // Step 3: Check permission (only reservation owner or admin can cancel)
    const isOwner = reservation.user.id === userId;
    const isAdmin = reservation.user.isAdmin(); // We would check if the user is an admin here
    // const isAdmin = reservation.user.role.id === 1; // We would check if the user is an admin here

    if (!isOwner && !isAdmin) {
      throw new Error('You do not have permission to cancel this reservation');
    }

    // Step 4: Check if reservation can be canceled (not in the past)
    const now = new Date();
    const reservationDate = new Date(reservation.date);
    const startTimeParts = reservation.startHour.split(':');
    
    reservationDate.setHours(
      parseInt(startTimeParts[0]),
      parseInt(startTimeParts[1] || 0),
      0,
      0
    );
    
    if (reservationDate < now) {
      throw new Error('Cannot cancel a reservation that has already started or passed');
    }

    // Step 5: Update reservation status to canceled (assuming 4 is canceled status)
    const updatedReservation = await this.reservationRepository.updateStatus(
      reservationId,
      4, // Canceled status
      reason
    );

    // // Step 6: Send notification to admin if notification service is available
    // if (this.notificationService) {
    //   await this.notificationService.sendNotification({
    //     role: 1, // Admin role
    //     subject: 'Reservation Canceled',
    //     message: `Reservation for ${reservation.classroom.fullName} on ${new Date(reservation.date).toLocaleDateString()} from ${reservation.startHour} to ${reservation.finishHour} has been canceled by ${isOwner ? 'the user' : 'an administrator'}.${reason ? ` Reason: ${reason}` : ''}`
    //   });
    // }

    return { success: true, reservation: updatedReservation };
  }
}

export default CancelReservationUseCase;