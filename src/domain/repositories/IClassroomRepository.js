// Interfaz para el repositorio de Aulas
class IAulaRepository {
    // CRUD básico
    async create(classroom) { throw new Error("Method not implemented"); }
    async findById(id) { throw new Error("Method not implemented"); }
    async update(id, changes) { throw new Error("Method not implemented"); }
    async delete(id) { throw new Error("Method not implemented"); }

    // Specific searches
    async getByBlock(block) { throw new Error("Method not implemented"); }
    async getWithFeatures(features) { throw new Error("Method not implemented"); }
    async getAvailable(date, time) { throw new Error("Method not implemented"); }
}