import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/database.js';

const UserModel = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        // No 'field' needed if model attribute name matches column name
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // Set default value as per SQL
        field: 'role_id',
    },
    name: {
        type: DataTypes.STRING(80),
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING(80),
        allowNull: false,
        field: 'last_name', // Map to the SQL column name
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255), // Match the SQL length
        allowNull: false,
    },
}, {
    tableName: 'User',
    timestamps: false, // Keep this if your table doesn't have createdAt/updatedAt
});

export default UserModel;