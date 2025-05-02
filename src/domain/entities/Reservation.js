class Reservation {
    constructor({ id, user, classroom, reservationStatus, date, startHour, finishHour, tokenQr }) {
        this.id = id; // ID of the reservation
        this.user = user; // object containing user information
        this.classroom = classroom; // object containing classroom information
        this.reservationStatus = reservationStatus; // object containing reservation status information
        this.date = date; // Date of the reservation
        this.startHour = startHour; // Start hour of the reservation
        this.finishHour = finishHour; // Finish hour of the reservation
        this.tokenQr = tokenQr; // Token for QR code
        // this.dateExpiration = dateExpiration; // Expiration date of the token
    }
}

export default Reservation;