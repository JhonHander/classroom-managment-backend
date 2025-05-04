import { DataTypes } from 'sequelize';

const defineClassroomFeatureModel = (sequelize) => {
  const ClassroomFeatureModel = sequelize.define('ClassroomFeature', {
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
    tableName: 'ClassroomFeature',
    timestamps: false,
  });

  return ClassroomFeatureModel;
};

export default defineClassroomFeatureModel;