import { DataTypes } from 'sequelize';

const defineClassroomTypeModel = (sequelize) => {
  const ClassroomTypeModel = sequelize.define('ClassroomType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'ClassroomType',
    timestamps: false,
  });

  return ClassroomTypeModel;
};

export default defineClassroomTypeModel;