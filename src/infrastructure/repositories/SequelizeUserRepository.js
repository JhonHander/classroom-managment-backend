import IUserRepository from '../../domain/repositories/IUserRepository.js';
import { UserMapper } from '../mappers/UserMapper.js';
import { Op } from 'sequelize';

export class SequelizeUserRepository extends IUserRepository {
    constructor(userModel, roleModel) {
        super();
        this.userModel = userModel;
        this.roleModel = roleModel;
    }

    _includeRelations() {
        return [
            { model: this.roleModel, as: 'role' }
        ];
    }

    async _createOrUpdate(user) {
        const userData = UserMapper.toModel(user);
        let userModelInstance;

        if (user.id) {
            userModelInstance = await this.userModel.findByPk(user.id);
            if (userModelInstance) {
                delete userData.id; // No intentar actualizar el ID
                // Considera no actualizar la contraseña si no se proporciona explícitamente
                if (!userData.password) {
                    delete userData.password;
                }
                await userModelInstance.update(userData);
            } else {
                // Opcional: lanzar error si se intenta actualizar un usuario inexistente
                throw new Error(`User with ID ${user.id} not found for update.`);
                // O crear uno nuevo si esa es la lógica deseada:
                // userModelInstance = await this.userModel.create(userData);
            }
        } else {
            // Crear nuevo usuario
            // Asegúrate de que el rol por defecto se asigna si no viene
            // if (!userData.role_id) {
            //   userData.role_id = ID_ROL_POR_DEFECTO;
            // }
            userModelInstance = await this.userModel.create(userData);
        }

        await userModelInstance.reload({ include: this._includeRelations() });
        return UserMapper.toDomain(userModelInstance);
    }

    async save(user) {
        // save puede ser ambiguo, a menudo significa create or update
        return this._createOrUpdate(user);
    }

    async create(user) {
        // Podrías llamar a save o implementar la lógica de creación aquí directamente
        const userData = UserMapper.toModel(user);
        // Asignar rol por defecto si es necesario
        const createdModel = await this.userModel.create(userData);
        await createdModel.reload({ include: this._includeRelations() });
        return UserMapper.toDomain(createdModel);
    }

    async findAll() {
        const userModels = await this.userModel.findAll({
            include: this._includeRelations(),
            attributes: { exclude: ['password'] } // Excluir password de la lista
        });
        return userModels.map(UserMapper.toDomain);
    }

    async update(user) {
        // Podrías llamar a save o implementar la lógica de actualización aquí
        const userModelInstance = await this.userModel.findByPk(user.id);
        if (!userModelInstance) return null; // O lanzar error

        const userData = UserMapper.toModel(user);
        delete userData.id;
        if (!userData.password) { // No actualizar password si no viene
            delete userData.password;
        }

        await userModelInstance.update(userData);
        await userModelInstance.reload({ include: this._includeRelations() });
        return UserMapper.toDomain(userModelInstance);
    }

    async delete(id) { // Asumiendo ID
        const result = await this.userModel.destroy({
            where: { id: id }
        });
        return result > 0;
    }

    async findByUsername(username) {
        const userModel = await this.userModel.findOne({
            where: { username: username }, // Asume que tienes campo username
            include: this._includeRelations()
            // No excluir password aquí si se necesita para autenticación posterior
        });
        return UserMapper.toDomain(userModel);
    }

    async findById(id) {
        const userModel = await this.userModel.findByPk(id, {
            include: this._includeRelations(),
            attributes: { exclude: ['password'] } // Excluir password
        });
        return UserMapper.toDomain(userModel);
    }

    async findByEmail(email) {
        const userModel = await this.userModel.findOne({
            where: { email: email },
            include: this._includeRelations()
            // No excluir password aquí si se necesita para autenticación posterior
        });
        return UserMapper.toDomain(userModel);
    }

    async findByEmailAndId(email, id) { // Asumiendo que dni se refiere al id
        const userModel = await this.userModel.findOne({
            where: { email: email, id: id },
            include: this._includeRelations(),
            attributes: { exclude: ['password'] }
        });
        return UserMapper.toDomain(userModel);
    }
}