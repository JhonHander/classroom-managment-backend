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
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'start_time',
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'end_time',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reservationStatusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Pendiente por defecto
      field: 'reservation_status_id',
    },
    qrToken: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'qr_token',
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expiration_date',
    },
  }, {
    tableName: 'Reservation',
    timestamps: false,
  });

  return ReservationModel;
};

export default defineReservationModel;