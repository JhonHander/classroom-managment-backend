import { IClassroomRepository } from '../../domain/repositories/IClassroomRepository.js';
// import ClassroomModel from '../db/models/ClassroomModel.js'; // Importa el modelo Sequelize
// import ClassroomTypeModel from '../db/models/ClassroomTypeModel.js'; // Si necesitas incluir el tipo
// import FeatureModel from '../db/models/FeatureModel.js'; // Si necesitas incluir características
import { Classroom } from '../../domain/entities/Classroom.js'; // Importa la entidad del dominio
import { Op } from 'sequelize'; // Para operadores complejos si son necesarios

export class SequelizeClassroomRepository extends IClassroomRepository {
    constructor(classroomModel, classroomTypeModel, featureModel) {
        super(); // Llama al constructor de la clase base si es necesario
        this.classroomModel = classroomModel;
        this.classroomTypeModel = classroomTypeModel; // Guarda los modelos inyectados
        this.featureModel = featureModel;
    }

    // --- Implementación de los métodos de la interfaz ---

    async findById(id) {
        const classroomRecord = await this.classroomModel.findByPk(id, {
            include: [ // Ejemplo de eager loading para asociaciones
                { model: this.classroomTypeModel, as: 'type' },
                { model: this.featureModel, as: 'features', through: { attributes: [] } } // Excluye atributos de la tabla de unión
            ]
        });
        if (!classroomRecord) return null;

        // Mapea el registro de Sequelize a la entidad del dominio
        // (Esto puede volverse más complejo y podrías usar un mapper dedicado)
        return new Classroom(
            classroomRecord.id,
            classroomRecord.block,
            classroomRecord.classroomNumber,
            // ... otros campos
            classroomRecord.type, // Objeto ClassroomType asociado
            classroomRecord.features // Array de Features asociadas
        );
    }

    async findAll() {
        const classroomRecords = await this.classroomModel.findAll({
            include: [
                { model: this.classroomTypeModel, as: 'type' },
                { model: this.featureModel, as: 'features', through: { attributes: [] } }
            ]
        });
        // Mapea cada registro a una entidad Classroom
        return classroomRecords.map(record => new Classroom(/*...*/));
    }

    async findAvailable(startTime, endTime, date, requiredFeatures = []) {
        // Esta consulta será más compleja:
        // 1. Encuentra aulas que NO tengan reservas solapadas en `Reservas`
        // 2. Encuentra aulas que NO tengan clases programadas solapadas en `Horarios`
        // 3. Filtra por características si `requiredFeatures` no está vacío
        // Necesitarás usar `Op.notIn`, subconsultas o JOINs complejos.
        // Retorna un array de entidades Classroom disponibles.
        throw new Error("Method findAvailable not implemented yet.");
    }


    async save(classroom) {
        // Si el classroom tiene ID, es una actualización, si no, una creación.
        // Necesitarás mapear la entidad Classroom de vuelta a un objeto
        // que ClassroomModel.create o instance.update entienda.
        if (classroom.id) {
            // Actualizar
            const classroomRecord = await this.classroomModel.findByPk(classroom.id);
            if (classroomRecord) {
                await classroomRecord.update({ /* ... campos mapeados ... */ });
                // Manejar asociaciones (ej. setFeatures) si es necesario
            } else {
                throw new Error(`Classroom with id ${classroom.id} not found`);
            }
        } else {
            // Crear
            const newRecord = await this.classroomModel.create({ /* ... campos mapeados ... */ });
            classroom.id = newRecord.id; // Actualiza el ID en la entidad
            // Manejar asociaciones (ej. setFeatures) si es necesario
        }
        return classroom; // Devuelve la entidad actualizada/creada
    }

    // ... Implementa otros métodos necesarios (delete, findByQrCode, etc.)

    async create(classroomData) {
        const classroom = await this.classroomModel.create(classroomData);
        return new Classroom({
            id: classroom.id,
            classroom_type_id: classroom.classroom_type_id,
            block: classroom.block,
            classroom_number: classroom.classroom_number,
            qr_code: classroom.qr_code,
            capacity: classroom.capacity
        });
    }
}