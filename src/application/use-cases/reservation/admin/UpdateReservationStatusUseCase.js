class UpdateReservationStatusUseCase {
  constructor(reservationRepository, userRepository, notificationService) {
    this.reservationRepository = reservationRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  async execute({ reservationId, newStatus, adminId, rejectionReason = null }) {
    // Step 1: Validate inputs
    if (!reservationId || !newStatus) {
      throw new Error('Reservation ID and new status are required');
    }

    // Step 2: Validate admin permissions (if admin ID is provided)
    if (adminId) {
      const admin = await this.userRepository.findById(adminId);
      if (!admin) {
        throw new Error(`Admin with ID ${adminId} not found`);
      }
      
      // Check if the user has admin permissions
      if (admin.role !== 1) { //  1 is the admin role
        throw new Error('Only administrators can approve or reject reservations');
      }
    }

    // Step 3: Get the reservation
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }

    // Step 4: Update the reservation status
    const updatedReservation = await this.reservationRepository.updateStatus(
      reservationId,
      newStatus,
      rejectionReason
    );

    // Step 5: Get the user who made the reservation
    const user = await this.userRepository.findById(reservation.userId);

    // Step 6: Send notification to the user
    if (this.notificationService) {
      const statusText = newStatus === 2 ? 'approved' : newStatus === 3 ? 'rejected' : 'updated';
      
      await this.notificationService.sendNotification({
        userId: user.id,
        subject: `Reservation ${statusText}`,
        message: `Your reservation for ${reservation.classroom.fullName} on ${new Date(reservation.date).toLocaleDateString()} from ${reservation.startHour} to ${reservation.finishHour} has been ${statusText}${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`
      });
    }

    return updatedReservation;
  }
}

export default UpdateReservationStatusUseCase;