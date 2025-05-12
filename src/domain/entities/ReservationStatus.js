class ReservationStatus {
    constructor({ id, name }) {
        this.id = id; // ID of the reservation status
        this.name = name; // Name of the reservation status (e.g., pending, approved, rejected)
    }
    // Method to get the status name
    getStatusName() {
        return this.name; // Returns the name of the reservation status
    }

}

export default ReservationStatus;