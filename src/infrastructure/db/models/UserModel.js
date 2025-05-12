import { DataTypes } from 'sequelize';

const defineUserModel = (sequelize) => {
  const UserModel = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // defaultValue: 1,
        field: 'role_id',
    },
    name: {
        type: DataTypes.STRING(80),
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING(80),
        allowNull: false,
        field: 'last_name',
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
  }, {
    tableName: 'User',
    timestamps: false,
  });

  return UserModel;
};

export default defineUserModel;