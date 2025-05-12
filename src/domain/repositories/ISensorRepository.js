class ISensorRepository {
    // CRUD básico
    async create(sensor) { throw new Error("Method not implemented"); }
    async findAll() { throw new Error("Method not implemented"); }
    async update(sensor) { throw new Error("Method not implemented"); }
    async delete(sensorId) { throw new Error("Method not implemented"); }

    // Búsquedas específicas
    async findById(id) { throw new Error("Method not implemented"); }
    async findByClassroomId(classroomId) { throw new Error("Method not implemented"); }
    async findActiveSensors() { throw new Error("Method not implemented"); }
    async findInactiveSensors() { throw new Error("Method not implemented"); }
    async updateSensorStatus(sensorId, status) { throw new Error("Method not implemented"); }
}

export default ISensorRepository;