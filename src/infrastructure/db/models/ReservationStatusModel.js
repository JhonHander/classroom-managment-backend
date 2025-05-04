import { DataTypes } from 'sequelize';

const defineReservationStatusModel = (sequelize) => {
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
    return ReservationStatusModel;
};

export default defineReservationStatusModel;