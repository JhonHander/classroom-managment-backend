import { DataTypes } from 'sequelize';

const defineSensorModel = (sequelize) => {
    const SensorModel = sequelize.define('Sensor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    classroomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'classroom_id', // Mapea el atributo camelCase 'classroomId' a la columna snake_case 'classroom_id'
        // La referencia FOREIGN KEY se definirá luego en las asociaciones
    },
    status: {
        type: DataTypes.ENUM('activo', 'inactivo', 'mantenimiento'), // Define el tipo ENUM con los valores permitidos
        allowNull: false, // Asumiendo que siempre debe tener un estado, aunque tenga default
        defaultValue: 'activo', // Establece el valor por defecto
    },
    }, {
    tableName: 'Sensor', // Nombre exacto de la tabla en la BD
    timestamps: false,
    });
    return SensorModel;
}

// La asociación con ClassroomModel (Aulas) se definirá en el archivo central de modelos/asociaciones.

export default defineSensorModel;