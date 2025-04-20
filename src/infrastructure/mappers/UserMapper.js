import { User } from '../../domain/entities/User.js';
import { RoleMapper } from './RoleMapper.js'; // Importa el RoleMapper

export class UserMapper {

  /**
   * Maps a UserModel to a User domain entity.
   * @param {Object} userModel - The UserModel object to map.
   * @returns {User} - The mapped User domain entity.
   */

  static toDomain(userModel) {
    if (!userModel) return null;

    // Mapeo del rol asociado usando RoleMapper
    // Asume que la asociación se llama 'role' (definido con as: 'role') y se cargó con include
    const role = userModel.role ? RoleMapper.toDomain(userModel.role) : null;

    if (!role) {
      throw new Error('Role not found in user model');
    }

    return new User({
      id: userModel.id,
      role: role, // Pasa el objeto Role mapeado
      name: userModel.nombre,
      lastName: userModel.apellido,
      email: userModel.correo,
      password: userModel.password,
    });
  }


  /**
   * Maps a User domain entity to a UserModel.
   * @param {User} user - The User domain entity to map.
   * @returns {Object} - The mapped UserModel.
   */

  static toModel(user) {
    if (!user) return null;
    // Devuelve un objeto plano para Sequelize
    return {
      id: user.id,
      roleId: user.role ? user.role.id : null, // Usa el ID del rol para la FK
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      password: user.password, // Asegúrate de que este campo sea el correcto en tu modelo
    };
  }
}