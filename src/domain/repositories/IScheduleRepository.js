// Interfaz para el repositorio de Horarios
class IScheduleRepository {
    // CRUD básico
    async create(schedule) { throw new Error("Method not implemented"); }
    async findAll() { throw new Error("Method not implemented"); }
    async update(schedule) { throw new Error("Method not implemented"); }
    async delete(schedule) { throw new Error("Method not implemented"); }

    // Búsquedas específicas
    async findById(id) { throw new Error("Method not implemented"); }
    async findByClassroomId(classroomId) { throw new Error("Method not implemented"); }
    async getAvailableSchedules(classroomId, date) { throw new Error("Method not implemented"); }
    async getSchedulesByDay(date) { throw new Error("Method not implemented"); }
    async getSchedulesByClassroomIdAndDate(classroomId, date) { throw new Error("Method not implemented"); }
    async getSchedulesByClassroomIdAndDateAndTime(classroomId, date, startTime, endTime) { throw new Error("Method not implemented"); }
}

export default IScheduleRepository;