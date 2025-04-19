// Interfaz para el repositorio de Usuarios
export class IUserRepository {
    async save(user) { throw new Error("Method not implemented"); }
    //CRUD básico para User
    async create(user) { throw new Error("Method not implemented"); }
    async findAll() { throw new Error("Method not implemented"); }
    async update(user) { throw new Error("Method not implemented"); }
    async delete(user) { throw new Error("Method not implemented"); }

    // Búsqudas específicas
    async findByUsername(username) { throw new Error("Method not implemented"); }
    async findById(id) { throw new Error("Method not implemented"); }
    async findByEmail(email) { throw new Error("Method not implemented"); }
    async findByEmailAndId(email, dni) { throw new Error("Method not implemented"); }


}