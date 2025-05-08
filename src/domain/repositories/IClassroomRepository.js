// Interfaz para el repositorio de Aulas
class IClassroomRepository {
    // CRUD básico
    async create(classroom) { throw new Error("Method not implemented"); }
    async findById(id) { throw new Error("Method not implemented"); }
    async update(id, changes) { throw new Error("Method not implemented"); }
    async delete(id) { throw new Error("Method not implemented"); }

    // Specific searches
    
    async findOne(full_name) { throw new Error("Method not implemented"); }
    async getByBlock(block) { throw new Error("Method not implemented"); }
    async getWithFeatures(features) { throw new Error("Method not implemented"); }
    async getAvailable(date, time) { throw new Error("Method not implemented"); }
    async findAll() { throw new Error("Method not implemented"); }
}

export default IClassroomRepository;