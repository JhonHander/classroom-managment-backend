class Schedule {
    constructor({ id, day, start_hour, finish_hour, classroom_id }) {
        this.id = id; // ID of the schedule
        this.day = day; // Day of the week (e.g., Monday, Tuesday)
        this.start_hour = start_hour; // Start hour of the schedule
        this.finish_hour = finish_hour; // Finish hour of the schedule
        this.classroom_id = classroom_id; // ID of the classroom associated with the schedule
    }
}