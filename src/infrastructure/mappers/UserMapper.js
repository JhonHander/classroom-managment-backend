import User from '../../domain/entities/User.js';
import { RoleMapper } from './RoleMapper.js';

export class UserMapper {

  /**
   * Maps a UserModel to a User domain entity.
   * @param {Object} userModel - The UserModel object to map.
   * @returns {User} - The mapped User domain entity.
   */

  static toDomain(userModel) {
    if (!userModel) return null;

    // Map the role
    const role = userModel.role ? RoleMapper.toDomain(userModel.role) : null;

    if (!role) {
      throw new Error('Role not found in user model');
    }

    return new User({
      id: userModel.id,
      role: role,
      name: userModel.name,
      lastName: userModel.lastName,
      email: userModel.email,
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
      roleId: user.role.id, // Match the model field 'roleId'
      name: user.name,
      lastName: user.lastName, // Match the model field 'lastName'
      email: user.email,
      password: user.password,
    };
  }
}