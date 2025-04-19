//Interfaz para el repositorio de Reservas
export class IReservationRepository {
    // CRUD básico
    async create(reservation) { throw new Error("Method not implemented"); }
    async findAll() { throw new Error("Method not implemented"); }
    async update(reservation) { throw new Error("Method not implemented"); }
    async delete(reservation) { throw new Error("Method not implemented"); }

    // Búsquedas específicas
    async findById(id) { throw new Error("Method not implemented"); }
    async findByUserId(userId) { throw new Error("Method not implemented"); }
    async findByClassroomId(classroomId) { throw new Error("Method not implemented"); }
    async findByDate(date) { throw new Error("Method not implemented"); }
    async findByDateAndClassroomId(date, classroomId) { throw new Error("Method not implemented"); }
    async findByStartAndFinishAndClassroomId(start, finish, classroomId) { throw new Error("Method not implemented"); }
    async validateTokenQr(token) { throw new Error("Method not implemented"); }
    async findByTokenQr(token) { throw new Error("Method not implemented"); }
    async findByUserIdAndDate(userId, date) { throw new Error("Method not implemented"); }
}