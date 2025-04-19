import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/database.js'; // Ajusta la ruta si es necesario

const ScheduleModel = sequelize.define('Schedule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    classroomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'classroom_id', // Mapea classroomId a classroom_id
        // La referencia FOREIGN KEY se definirá en las asociaciones
    },
    day: {
        type: DataTypes.ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'),
        allowNull: false,
    },
    startHour: {
        type: DataTypes.TIME, // Tipo TIME para horas
        allowNull: false,
        field: 'start_hour', // Mapea startHour a start_hour
    },
    finishHour: {
        type: DataTypes.TIME, // Tipo TIME para horas
        allowNull: false,
        field: 'finish_hour', // Mapea finishHour a finish_hour
    },
}, {
    tableName: 'Schedule', // Nombre exacto de la tabla en la BD
    timestamps: false, // Deshabilita createdAt y updatedAt
});

export default ScheduleModel;