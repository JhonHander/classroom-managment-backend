import { DataTypes } from 'sequelize';

const defineClassroomModel = (sequelize) => {
  const ClassroomModel = sequelize.define('Classroom', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    block: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    classroomNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'classroom_number',
    },
    // qrCode: {
    //   type: DataTypes.STRING(255),
    //   allowNull: true,
    //   field: 'qr_code',
    // },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classroomFullName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'classroom_full_name',
    },
    classroomTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'classroom_type_id',
    }
  }, {
    tableName: 'Classroom',
    timestamps: false,
  });

  return ClassroomModel;
};

export default defineClassroomModel;