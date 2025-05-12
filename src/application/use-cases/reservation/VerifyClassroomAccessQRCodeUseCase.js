class VerifyClassroomAccessQRCodeUseCase {
  constructor(reservationRepository, jwtService, sensorRepository) {
    this.reservationRepository = reservationRepository;
    this.jwtService = jwtService;
    this.sensorRepository = sensorRepository;
  }

  async execute(token) {
    // Step 1: Validate input
    if (!token) {
      throw new Error('Access token is required');
    }

    // Step 2: Verify the token
    try {
      const decoded = await this.jwtService.verifyToken(token);
      
      // Step 3: Check if the reservation exists
      const reservation = await this.reservationRepository.findById(decoded.reservationId);
      if (!reservation) {
        throw new Error('Invalid reservation');
      }

      // Step 4: Validate the token belongs to the correct reservation
      if (reservation.tokenQr !== token) {
        throw new Error('Invalid QR code for this reservation');
      }

      // Step 5: Check if the token has expired
      if (reservation.dateExpiration && new Date(reservation.dateExpiration) < new Date()) {
        throw new Error('QR code has expired');
      }

      // Step 6: Check if the reservation is for the current time
      const now = new Date();
      const reservationDate = new Date(reservation.date);
      
      // Ensure it's the same day
      if (reservationDate.toDateString() !== now.toDateString()) {
        throw new Error('This reservation is not for today');
      }
      
      // Check if current time is within reservation hours
      const startParts = reservation.startHour.split(':');
      const endParts = reservation.finishHour.split(':');
      
      const startTime = new Date(reservationDate);
      startTime.setHours(parseInt(startParts[0]), parseInt(startParts[1] || 0), 0, 0);
      
      const endTime = new Date(reservationDate);
      endTime.setHours(parseInt(endParts[0]), parseInt(endParts[1] || 0), 0, 0);
      
      if (now < startTime) {
        throw new Error('It is too early to access this classroom');
      }
      
      if (now > endTime) {
        throw new Error('The reservation period has ended');
      }

      // // Step 7: Register access event (optional)
      // if (this.sensorRepository) {
      //   await this.sensorRepository.recordAccessEvent({
      //     reservationId: reservation.id,
      //     userId: decoded.userId,
      //     classroomId: reservation.classroomId,
      //     timestamp: new Date(),
      //     accessType: 'qr_scan'
      //   });
      // }

      // Step 8: Return access granted response
      return {
        accessGranted: true,
        reservationInfo: {
          id: reservation.id,
          classroomId: reservation.classroomId,
          classroomFullName: reservation.classroom.fullName,
          date: reservation.date,
          startHour: reservation.startHour,
          finishHour: reservation.finishHour,
          user: {
            id: reservation.user.id,
            name: reservation.user.name,
            lastName: reservation.user.lastName
          }
        }
      };
    } catch (error) {
      // Step 9: Return access denied response with reason
      return {
        accessGranted: false,
        error: error.message || 'Invalid QR code'
      };
    }
  }
}

export default VerifyClassroomAccessQRCodeUseCase;