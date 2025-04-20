class Schedule {
    constructor({ id, classroom, day, startHour, finishHour }) {
        this.id = id; // ID of the schedule
        this.classroom = classroom; // object containing classroom information
        this.day = day; // Day of the week (e.g., Monday, Tuesday)
        this.startHour = startHour; // Start hour of the schedule
        this.finishHour = finishHour; // Finish hour of the schedule
    }
}