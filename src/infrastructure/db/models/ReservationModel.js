import { DataTypes } from 'sequelize';

const defineReservationModel = (sequelize) => {
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
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
    reservationStatusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Pendiente por defecto
      field: 'reservation_status_id',
    },
  }, {
    tableName: 'Reservation',
    timestamps: false,
  });

  return ReservationModel;
};

export default defineReservationModel;