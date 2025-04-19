import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/database.js';

const ReservationStatusModel = sequelize.define('ReservationStatus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
}, {
    tableName: 'ReservationStatus', // Nombre exacto de la tabla en la BD
    timestamps: false,
});

export default ReservationStatusModel;