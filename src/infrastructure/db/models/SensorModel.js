import { DataTypes } from 'sequelize';

const defineSensorModel = (sequelize) => {
    const SensorModel = sequelize.define('Sensor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false, // Cambiado a false para permitir IDs específicos
    },
    classroomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'classroom_id',
        references: {
            model: 'Classroom',
            key: 'id'
        }
    },    status: {
        type: DataTypes.ENUM('activo', 'inactivo', 'mantenimiento'),
        allowNull: false,
        defaultValue: 'activo',
    }
    }, {
    tableName: 'Sensor', // Nombre exacto de la tabla en la BD
    timestamps: false,
    });
    return SensorModel;
}

// La asociación con ClassroomModel (Aulas) se definirá en el archivo central de modelos/asociaciones.

export default defineSensorModel;