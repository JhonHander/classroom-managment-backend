// import { IClassroomRepository } from '../../domain/repositories/IClassroomRepository.js';
// import { ClassroomMapper } from '../mappers/ClassroomMapper.js';
// import { Op } from 'sequelize';

// export class SequelizeClassroomRepository extends IClassroomRepository {
//   constructor(classroomModel, classroomTypeModel, featureModel) {
//     super();
//     this.classroomModel = classroomModel;
//     this.classroomTypeModel = classroomTypeModel;
//     this.featureModel = featureModel;
//   }

//   async findById(id) {
//     const classroomRecord = await this.classroomModel.findByPk(id, {
//       include: [
//         { model: this.classroomTypeModel, as: 'classroomType' },
//         // { model: this.featureModel, as: 'features', through: { attributes: [] } }
//       ]
//     });
//     return ClassroomMapper.toDomain(classroomRecord);
//   }

//   async create(classroom) {
//     const classroomModel = ClassroomMapper.toModel(classroom);
//     const newClassroom = await this.classroomModel.create(classroomModel);

//     // Gestionar las características a través de la tabla intermedia
//     if (classroom.features && classroom.features.length > 0) {
//       await newClassroom.setFeatures(classroom.features.map(f => f.id));
//     }

//     // Recargar el aula para obtener las características asociadas
//     const createdClassroom = await this.classroomModel.findByPk(newClassroom.id, {
//       include: [
//         { model: this.classroomTypeModel, as: 'type' },
//         { model: this.featureModel, as: 'features', through: { attributes: [] } },
//       ],
//     });

//     return ClassroomMapper.toDomain(createdClassroom);
//   }

//   async update(classroom) {
//     const classroomModel = ClassroomMapper.toModel(classroom);
//     await this.classroomModel.update(classroomModel, {
//       where: { id: classroom.id },
//     });
//     const updatedClassroom = await this.classroomModel.findByPk(classroom.id, {
//       include: [
//         { model: this.classroomTypeModel, as: 'type' },
//         { model: this.featureModel, as: 'features', through: { attributes: [] } },
//       ],
//     });
//     // Gestionar las características a través de la tabla intermedia
//     if (classroom.features && classroom.features.length > 0) {
//       await updatedClassroom.setFeatures(classroom.features.map((f) => f.id));
//     } else {
//       await updatedClassroom.setFeatures([]); // Eliminar todas las características si no hay nuevas
//     }
//     return ClassroomMapper.toDomain(updatedClassroom);
//   }
//   // ... otros métodos (findAll, delete, etc.)
//   async findAll() {
//     const classroomRecords = await this.classroomModel.findAll({
//       include: [
//         { model: this.classroomTypeModel, as: 'type' },
//         { model: this.featureModel, as: 'features', through: { attributes: [] } }
//       ]
//     });
//     return classroomRecords.map(ClassroomMapper.toDomain);
//   }

//   async delete(id) {
//     await this.classroomModel.destroy({ where: { id } });
//   }

//   async findByBlockAndNumber(block, classroomNumber) {
//     const classroomRecord = await this.classroomModel.findOne({
//       where: { block, classroomNumber },
//       include: [
//         { model: this.classroomTypeModel, as: 'type' },
//         { model: this.featureModel, as: 'features', through: { attributes: [] } }
//       ]
//     });
//     return ClassroomMapper.toDomain(classroomRecord);
//   }

//   async save(classroom) {
//     if (classroom.id) {
//       return this.update(classroom);
//     } else {
//       return this.create(classroom);
//     }
//   }
// }

import IClassroomRepository from '../../domain/repositories/IClassroomRepository.js';
import { ClassroomMapper } from '../mappers/ClassroomMapper.js';
import { Op } from 'sequelize'; // Necesario para consultas complejas

export class SequelizeClassroomRepository extends IClassroomRepository {
  constructor(classroomModel, classroomTypeModel, classroomFeatureModel, reservationModel) {
    super();
    this.classroomModel = classroomModel;
    this.classroomTypeModel = classroomTypeModel;
    this.classroomFeatureModel = classroomFeatureModel;
    this.reservationModel = reservationModel; // Necesario para getAvailable
  }

  _includeRelations() {
    return [
      { model: this.classroomTypeModel, as: 'classroomType' },
      {
        model: this.classroomFeatureModel,
        as: 'features',
        through: { attributes: [] } // No incluir atributos de la tabla de unión
      }
    ];
  }

  async create(classroom) {
    const classroomData = ClassroomMapper.toModel(classroom);
    const createdModel = await this.classroomModel.create(classroomData);

    // Manejar relación Many-to-Many con Features
    if (classroom.features && classroom.features.length > 0) {
      const featureIds = classroom.features.map(feature => feature.id);
      await createdModel.setFeatures(featureIds); // Asocia las características
    }

    // Recargar para obtener las asociaciones incluidas
    await createdModel.reload({ include: this._includeRelations() });
    return ClassroomMapper.toDomain(createdModel);
  }

  async findById(id) {
    const classroomModel = await this.classroomModel.findByPk(id, {
      include: this._includeRelations()
    });
    return ClassroomMapper.toDomain(classroomModel);
  }

  async update(id, classroomChanges) {
    const classroomModel = await this.classroomModel.findByPk(id);
    if (!classroomModel) {
      return null; // O lanzar un error NotFoundError
    }

    const classroomData = ClassroomMapper.toModel(classroomChanges);
    // Elimina el ID de los datos a actualizar para evitar problemas
    delete classroomData.id;

    await classroomModel.update(classroomData);

    // Manejar actualización de relación Many-to-Many con Features
    if (classroomChanges.features) { // Permite enviar un array vacío para desasociar todas
      const featureIds = classroomChanges.features.map(feature => feature.id);
      await classroomModel.setFeatures(featureIds);
    }

    await classroomModel.reload({ include: this._includeRelations() });
    return ClassroomMapper.toDomain(classroomModel);
  }

  async delete(id) {
    const result = await this.classroomModel.destroy({
      where: { id: id }
    });
    return result > 0; // Devuelve true si se eliminó al menos una fila
  }

  async getByBlock(block) {
    const classroomModels = await this.classroomModel.findAll({
      where: { block: block },
      include: this._includeRelations()
    });
    return classroomModels.map(ClassroomMapper.toDomain(classroomModels));
  }

  async getWithFeatures(featureIds) {
    if (!Array.isArray(featureIds) || featureIds.length === 0) {
      return [];
    }
    const classroomModels = await this.classroomModel.findAll({
      include: [
        { model: this.classroomTypeModel, as: 'classroomType' },
        {
          model: this.classroomFeatureModel,
          as: 'features',
          where: { id: { [Op.in]: featureIds } },
          through: { attributes: [] },
          required: true // INNER JOIN para asegurar que tenga al menos una de las features
        }
      ],
      // Opcional: si quieres aulas que tengan TODAS las features especificadas
      // group: ['ClassroomModel.id'], // Agrupa por aula
      // having: sequelize.literal(`COUNT(DISTINCT "features"."id") = ${featureIds.length}`) // Cuenta las features distintas
    });
    return classroomModels.map(ClassroomMapper.toDomain);
  }

  async getAvailable(startTime, endTime) {
    // Encuentra IDs de aulas que tienen reservas que se solapan con el rango dado
    const reservedClassroomIds = await this.reservationModel.findAll({
      attributes: ['classroom_id'],
      where: {
        // La reserva termina después de que inicia el rango Y
        // La reserva inicia antes de que termine el rango
        end_time: { [Op.gt]: startTime },
        start_time: { [Op.lt]: endTime },
        // Podrías añadir filtro por estado de reserva si es necesario (ej: solo confirmadas)
        // reservation_status_id: ID_DEL_ESTADO_CONFIRMADO
      },
      group: ['classroom_id'],
      raw: true, // Obtener solo los datos planos
    }).then(reservations => reservations.map(r => r.classroom_id));

    // Encuentra todas las aulas que NO están en la lista de reservadas
    const availableClassrooms = await this.classroomModel.findAll({
      where: {
        id: { [Op.notIn]: reservedClassroomIds }
      },
      include: this._includeRelations(),
      order: [['classroomFullName', 'ASC']] // Opcional: ordenar resultados
    });

    return availableClassrooms.map(ClassroomMapper.toDomain(availableClassrooms));
  }
}