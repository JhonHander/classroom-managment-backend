class Reservation {
    constructor({ id, user_id, classroom_id, reservation_status_id, date, start_hour, finish_hour }) {
        this.id = id; // ID of the reservation
        this.user_id = user_id; // ID of the user who made the reservation
        this.classroom_id = classroom_id; // ID of the classroom reserved
        this.reservation_status_id = reservation_status_id; // Status of the reservation (e.g., confirmed, canceled)
        this.date = date; // Date of the reservation
        this.start_hour = start_hour; // Start hour of the reservation
        this.finish_hour = finish_hour; // Finish hour of the reservation
    }
}