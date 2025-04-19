import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/database.js'; // Ajusta la ruta si es necesario

const ReservationModel = sequelize.define('Reservation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
    },
    classroomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'classroom_id',
    },
    reservationStatusId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'reservation_status_id',
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'date',
    },
    startHour: {
        type: DataTypes.TIME,
        allowNull: false,
        field: 'start_hour',
    },
    finishHour: {
        type: DataTypes.TIME,
        allowNull: false,
        field: 'finish_hour',
    },
    token_qr: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'token_qr',
    },
    // dateExpiration: {
    //     type: DataTypes.DATEONLY,
    //     allowNull: false,
    //     field: 'date_expiration',
    // },
}, {
    tableName: 'Reservation', // Nombre exacto de la tabla en la BD
    timestamps: false, // Deshabilita createdAt y updatedAt si no existen en la tabla
});

export default ReservationModel;