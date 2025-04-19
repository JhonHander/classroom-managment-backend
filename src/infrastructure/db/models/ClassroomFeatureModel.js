import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/database.js'; // Ajusta la ruta si es necesario

const ClassroomFeatureModel = sequelize.define('ClassroomFeature', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true, // Asegura que los nombres de las características sean únicos
    },
}, {
    tableName: 'ClassroomFeature', // Nombre exacto de la tabla en la BD
    timestamps: false,
});

export default ClassroomFeatureModel;