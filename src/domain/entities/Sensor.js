class Sensor {
    constructor({ id, classroom_id, status }) {
        this.id = id; // ID of the sensor
        this.classroom_id = classroom_id; // ID of the classroom associated with the sensor
        this.status = status; // Status of the sensor (e.g., active, inactive)
    }
}