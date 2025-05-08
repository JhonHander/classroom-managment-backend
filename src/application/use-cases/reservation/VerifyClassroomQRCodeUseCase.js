class VerifyClassroomQRCodeUseCase {
  constructor(reservationRepository, classroomRepository, userRepository) {
    this.reservationRepository = reservationRepository;
    this.classroomRepository = classroomRepository;
    this.userRepository = userRepository;
  }

  async execute({ classroomCode, userId }) {
    // Step 1: Validate input
    if (!classroomCode || !userId) {
      throw new Error('Classroom code and user ID are required');
    }

    // Step 2: Find the classroom by its fullName (code in QR)
    const classroom = await this.classroomRepository.findByFullName(classroomCode);
    if (!classroom) {
      throw new Error(`Classroom with code ${classroomCode} not found`);
    }

    // Step 3: Check if the user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Step 4: Find pending reservations for this user in this classroom
    const currentDate = new Date();
    const pendingReservations = await this.reservationRepository.findPendingReservationsByUserAndClassroom(
      userId,
      classroom.id,
      currentDate
    );

    if (pendingReservations.length === 0) {
      throw new Error('No pending reservations found for this user in this classroom at the current time');
    }

    // Step 5: Check if there is a valid reservation for the current time
    let validReservation = null;
    for (const reservation of pendingReservations) {
      const reservationDate = new Date(reservation.date);
      if (reservationDate.toDateString() !== currentDate.toDateString()) {
        continue; // Not today's reservation
      }

      // Parse reservation time
      const startTimeParts = reservation.startHour.split(':');
      const endTimeParts = reservation.finishHour.split(':');
      
      const startTime = new Date(reservationDate);
      startTime.setHours(parseInt(startTimeParts[0]), parseInt(startTimeParts[1] || 0), 0, 0);
      
      const endTime = new Date(reservationDate);
      endTime.setHours(parseInt(endTimeParts[0]), parseInt(endTimeParts[1] || 0), 0, 0);
      
      // Acceptable window for confirmation: from 15 minutes before start time to end time
      const confirmationWindow = new Date(startTime);
      confirmationWindow.setMinutes(confirmationWindow.getMinutes() - 15);
      
      if (currentDate >= confirmationWindow && currentDate <= endTime) {
        validReservation = reservation;
        break;
      }
    }

    if (!validReservation) {
      throw new Error('No valid pending reservations found for the current time');
    }

    // Step 6: Update the reservation status to confirmed (assuming 2 is confirmed status)
    const updatedReservation = await this.reservationRepository.updateStatus(
      validReservation.id,
      2, // Confirmed status
      'Confirmed by QR code scan'
    );

    // Step 7: Return the confirmed reservation
    return {
      success: true,
      message: 'Reservation confirmed successfully',
      reservation: updatedReservation
    };
  }
}

export default VerifyClassroomQRCodeUseCase;