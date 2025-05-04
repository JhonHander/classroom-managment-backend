import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/database.js';

const ClassroomModel = sequelize.define('Classroom', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    classroomTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'classroom_type_id',
        // references: { // Las referencias se definen mejor en las asociaciones
        //   model: 'TiposAula', // Nombre de la tabla referenciada
        //   key: 'id',
        // },
    },
    block: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    classroomNumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'classroom_number', // Mapea explícitamente al nombre de columna SQL si difiere del camelCase
    },
    classroomFullName: {
        type: DataTypes.STRING(20),
        // Sequelize no maneja directamente 'GENERATED ALWAYS AS',
        // pero definimos la columna. La base de datos se encargará de poblarla.
        // Podrías usar un getter virtual si necesitas calcularlo en la app.
        field: 'classroom_full_name',
        // allowNull: true, // Depende de si la DB permite NULL antes de generar
    },
    // qrCode: {
    //     type: DataTypes.STRING(100),
    //     allowNull: false,
    //     unique: true,
    //     field: 'qr_code',
    // },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
    // No necesitamos createdAt/updatedAt si no están en la tabla SQL
}, {
    tableName: 'Classroom', // Nombre exacto de la tabla en la BD
    timestamps: false, // Deshabilita createdAt y updatedAt si no existen en la tabla
    // underscored: true, // Descomenta si usas snake_case para los campos automáticos (createdAt, updatedAt)
});

// --- Asociaciones (se definirán después de crear todos los modelos) ---
// ClassroomModel.belongsTo(ClassroomTypeModel, { foreignKey: 'tipo_id', as: 'type' });
// ClassroomModel.belongsToMany(FeatureModel, { through: 'Aula_Caracteristicas', foreignKey: 'aula_id', otherKey: 'caracteristica_id', as: 'features' });

export default ClassroomModel;