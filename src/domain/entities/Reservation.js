class Reservation {
    constructor({ id, userId, classroomId, reservationStatusId, date, startHour, finishHour, tokenQr, dateExpiration }) {
        this.id = id; // ID of the reservation
        this.userId = userId; // ID of the user who made the reservation
        this.classroomId = classroomId; // ID of the classroom reserved
        this.reservationStatusId = reservationStatusId; // Status of the reservation (e.g., confirmed, canceled)
        this.date = date; // Date of the reservation
        this.startHour = startHour; // Start hour of the reservation
        this.finishHour = finishHour; // Finish hour of the reservation
        this.tokenQr = tokenQr; // Token for QR code
        this.dateExpiration = dateExpiration; // Expiration date of the token
    }
}