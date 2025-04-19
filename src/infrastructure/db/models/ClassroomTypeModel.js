import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/database.js';

const ClassroomTypeModel = sequelize.define('ClassroomType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true, // Asegura que los nombres de los tipos sean únicos
    },
}, {
    tableName: 'ClassroomType', // Nombre exacto de la tabla en la BD
    timestamps: false,
});

export default ClassroomTypeModel;