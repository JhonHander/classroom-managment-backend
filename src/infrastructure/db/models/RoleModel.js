import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/database.js';

const RoleModel = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
}, {
    tableName: 'Role', // Nombre exacto de la tabla en la BD
    timestamps: false, // Deshabilita createdAt y updatedAt si no existen en la tabla
});

export default RoleModel;
