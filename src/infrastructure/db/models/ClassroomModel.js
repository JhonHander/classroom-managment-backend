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
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classroomFullName: {
      type: DataTypes.STRING(50),
      field: 'classroom_full_name',
      // No permitimos actualizaciones ya que es una columna generada
      set() {
        throw new Error('The field classroom_full_name is auto-generated and cannot be set directly');
      }
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