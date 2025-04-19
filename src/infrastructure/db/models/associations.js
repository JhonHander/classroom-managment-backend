import { sequelize } from '../../../config/database.js';

// Importa todos tus modelos
import RoleModel from './RoleModel.js';
import UserModel from './UserModel.js';
import ScheduleModel from './ScheduleModel.js';
import ClassroomTypeModel from './ClassroomTypeModel.js';
import ClassroomFeatureModel from './ClassroomFeatureModel.js';
import ClassroomModel from './ClassroomModel.js';
// No necesitamos un modelo explícito para la tabla de unión si no tiene campos adicionales
// import ClassroomWithFeatureModel from './ClassroomWithFeatureModel.js';
import ReservationStatusModel from './ReservationStatusModel.js';
import ReservationModel from './ReservationModel.js';
import SensorModel from './SensorModel.js';

// --- Definición de Asociaciones ---

// 1. Role <-> User (One-to-Many)
RoleModel.hasMany(UserModel, {
    foreignKey: 'role_id', // Clave foránea en UserModel
    as: 'users'            // Alias para acceder a los usuarios desde un rol
});
UserModel.belongsTo(RoleModel, {
    foreignKey: 'role_id', // Clave foránea en UserModel
    as: 'role'             // Alias para acceder al rol desde un usuario
});

// 2. Classroom <-> Schedule (One-to-Many)
ClassroomModel.hasMany(ScheduleModel, {
    foreignKey: 'classroom_id', // Clave foránea en ScheduleModel
    as: 'schedules',            // Alias
});
ScheduleModel.belongsTo(ClassroomModel, {
    foreignKey: 'classroom_id', // Clave foránea en ScheduleModel
    as: 'classroom'             // Alias
});

// 3. ClassroomType <-> Classroom (One-to-Many)
ClassroomTypeModel.hasMany(ClassroomModel, {
    foreignKey: 'classroom_type_id', // Clave foránea en ClassroomModel
    as: 'classrooms'                 // Alias
});
ClassroomModel.belongsTo(ClassroomTypeModel, {
    foreignKey: 'classroom_type_id', // Clave foránea en ClassroomModel
    as: 'classroomType'              // Alias
});

// 4. Classroom <-> ClassroomFeature (Many-to-Many through ClassroomWithFeature)
ClassroomModel.belongsToMany(ClassroomFeatureModel, {
    through: 'ClassroomWithFeature', // Nombre exacto de la tabla de unión
    foreignKey: 'classroom_id',           // Clave foránea en la tabla de unión que apunta a Classroom
    otherKey: 'classroom_feature_id',   // Clave foránea en la tabla de unión que apunta a ClassroomFeature
    as: 'features'                   // Alias para acceder a las características desde un aula
});
ClassroomFeatureModel.belongsToMany(ClassroomModel, {
    through: 'ClassroomWithFeature', // Nombre exacto de la tabla de unión
    foreignKey: 'classroom_feature_id',   // Clave foránea en la tabla de unión que apunta a ClassroomFeature
    otherKey: 'classroom_id',           // Clave foránea en la tabla de unión que apunta a Classroom
    as: 'classrooms'                 // Alias para acceder a las aulas desde una característica
});

// 5. User <-> Reservation (One-to-Many)
UserModel.hasMany(ReservationModel, {
    foreignKey: 'user_id', // Clave foránea en ReservationModel
    as: 'reservations'     // Alias
});
ReservationModel.belongsTo(UserModel, {
    foreignKey: 'user_id', // Clave foránea en ReservationModel
    as: 'user'             // Alias
});

// 6. Classroom <-> Reservation (One-to-Many)
ClassroomModel.hasMany(ReservationModel, {
    foreignKey: 'classroom_id', // Clave foránea en ReservationModel
    as: 'reservations'          // Alias
});
ReservationModel.belongsTo(ClassroomModel, {
    foreignKey: 'classroom_id', // Clave foránea en ReservationModel
    as: 'classroom'             // Alias
});

// 7. ReservationStatus <-> Reservation (One-to-Many)
ReservationStatusModel.hasMany(ReservationModel, {
    foreignKey: 'reservation_status_id', // Clave foránea en ReservationModel
    as: 'reservations'                   // Alias
});
ReservationModel.belongsTo(ReservationStatusModel, {
    foreignKey: 'reservation_status_id', // Clave foránea en ReservationModel
    as: 'reservationStatus'              // Alias
});

// 8. Classroom <-> Sensor (One-to-Many)
ClassroomModel.hasMany(SensorModel, {
    foreignKey: 'classroom_id', // Clave foránea en SensorModel
    as: 'sensors'               // Alias
});
SensorModel.belongsTo(ClassroomModel, {
    foreignKey: 'classroom_id', // Clave foránea en SensorModel
    as: 'classroom'             // Alias
});


// --- Exportar modelos y sequelize ---
// Exportamos todo para poder usarlo fácilmente en otras partes de la aplicación
export {
    sequelize, // La instancia de Sequelize configurada
    RoleModel,
    UserModel,
    ScheduleModel,
    ClassroomTypeModel,
    ClassroomFeatureModel,
    ClassroomModel,
    // No exportamos ClassroomWithFeatureModel si no lo definimos
    ReservationStatusModel,
    ReservationModel,
    SensorModel
};