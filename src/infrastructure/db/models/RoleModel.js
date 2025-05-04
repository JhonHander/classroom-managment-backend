import { DataTypes } from 'sequelize';

// En lugar de importar la instancia de sequelize, definiremos una función
// que toma sequelize como parámetro
const defineRoleModel = (sequelize) => {
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
    tableName: 'Role',
    timestamps: false,
  });

  return RoleModel;
};

export default defineRoleModel;
