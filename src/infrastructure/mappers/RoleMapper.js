import { Role } from '../../domain/entities/Role.js';

export class RoleMapper {

    /**
     * Maps a RoleModel to a Role domain entity.
     * @param {Object} roleModel - The RoleModel object to map.
     * @returns {Role} - The mapped Role domain entity.
     */

    static toDomain(roleModel) {
        if (!roleModel) return null;
        return new Role({
            id: roleModel.id,
            name: roleModel.name,
        }
        );
    }


    /**
     * Maps a Role domain entity to a RoleModel.
     * @param {Role} role - The Role domain entity to map.
     * @return {Object} - The mapped RoleModel.
     */

    static toModel(role) {
        return {
            id: role.id,
            nombre: role.name, // Asume que la entidad Role usa 'name'
        };
    }
}