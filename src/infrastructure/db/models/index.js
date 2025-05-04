// filepath: c:\Users\jhonh\OneDrive\Escritorio\Clases_U\programacion_movil\classroom-managment-backend\src\infrastructure\db\models\index.js
import defineRoleModel from './RoleModel.js';
import defineUserModel from './UserModel.js';
import defineClassroomModel from './ClassroomModel.js';
import defineClassroomTypeModel from './ClassroomTypeModel.js';
import defineClassroomFeatureModel from './ClassroomFeatureModel.js';
import defineReservationModel from './ReservationModel.js';
import defineReservationStatusModel from './ReservationStatusModel.js';
import defineScheduleModel from './ScheduleModel.js';
import defineSensorModel from './SensorModel.js';

// Esta función inicializa todos los modelos y configura sus asociaciones
const initModels = (sequelize) => {
  // Inicializar todos los modelos
  const models = {
    RoleModel: defineRoleModel(sequelize),
    UserModel: defineUserModel(sequelize),
    ClassroomModel: defineClassroomModel(sequelize),
    ClassroomTypeModel: defineClassroomTypeModel(sequelize),
    ClassroomFeatureModel: defineClassroomFeatureModel(sequelize),
    ReservationModel: defineReservationModel(sequelize),
    ReservationStatusModel: defineReservationStatusModel(sequelize),
    ScheduleModel: defineScheduleModel(sequelize),
    SensorModel: defineSensorModel(sequelize)
  };

  // Definir las asociaciones
  // 1. Role <-> User (One-to-Many)
  models.RoleModel.hasMany(models.UserModel, {
    foreignKey: 'role_id',
    as: 'users'
  });
  models.UserModel.belongsTo(models.RoleModel, {
    foreignKey: 'role_id',
    as: 'role'
  });

  // 2. Classroom <-> Schedule (One-to-Many)
  models.ClassroomModel.hasMany(models.ScheduleModel, {
    foreignKey: 'classroom_id',
    as: 'schedules',
  });
  models.ScheduleModel.belongsTo(models.ClassroomModel, {
    foreignKey: 'classroom_id',
    as: 'classroom'
  });

  // 3. ClassroomType <-> Classroom (One-to-Many)
  models.ClassroomTypeModel.hasMany(models.ClassroomModel, {
    foreignKey: 'classroom_type_id',
    as: 'classrooms'
  });
  models.ClassroomModel.belongsTo(models.ClassroomTypeModel, {
    foreignKey: 'classroom_type_id',
    as: 'classroomType'
  });

  // 4. Classroom <-> ClassroomFeature (Many-to-Many through ClassroomWithFeature)
  models.ClassroomModel.belongsToMany(models.ClassroomFeatureModel, {
    through: 'ClassroomWithFeature',
    foreignKey: 'classroom_id',
    otherKey: 'classroom_feature_id',
    as: 'features'
  });
  models.ClassroomFeatureModel.belongsToMany(models.ClassroomModel, {
    through: 'ClassroomWithFeature',
    foreignKey: 'classroom_feature_id',
    otherKey: 'classroom_id',
    as: 'classrooms'
  });

  // 5. User <-> Reservation (One-to-Many)
  models.UserModel.hasMany(models.ReservationModel, {
    foreignKey: 'user_id',
    as: 'reservations'
  });
  models.ReservationModel.belongsTo(models.UserModel, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // 6. Classroom <-> Reservation (One-to-Many)
  models.ClassroomModel.hasMany(models.ReservationModel, {
    foreignKey: 'classroom_id',
    as: 'reservations'
  });
  models.ReservationModel.belongsTo(models.ClassroomModel, {
    foreignKey: 'classroom_id',
    as: 'classroom'
  });

  // 7. ReservationStatus <-> Reservation (One-to-Many)
  models.ReservationStatusModel.hasMany(models.ReservationModel, {
    foreignKey: 'reservation_status_id',
    as: 'reservations'
  });
  models.ReservationModel.belongsTo(models.ReservationStatusModel, {
    foreignKey: 'reservation_status_id',
    as: 'reservationStatus'
  });

  // 8. Classroom <-> Sensor (One-to-Many)
  models.ClassroomModel.hasMany(models.SensorModel, {
    foreignKey: 'classroom_id',
    as: 'sensors'
  });
  models.SensorModel.belongsTo(models.ClassroomModel, {
    foreignKey: 'classroom_id',
    as: 'classroom'
  });

  return models;
};

export default initModels;