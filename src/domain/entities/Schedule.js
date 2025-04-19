class Schedule {
    constructor({ id, classroomId, day, startHour, finishHour }) {
        this.id = id; // ID of the schedule
        this.classroomId = classroomId; // ID of the classroom associated with the schedule
        this.day = day; // Day of the week (e.g., Monday, Tuesday)
        this.startHour = startHour; // Start hour of the schedule
        this.finishHour = finishHour; // Finish hour of the schedule
    }
}