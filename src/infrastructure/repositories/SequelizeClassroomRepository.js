import { IClassroomRepository } from '../../domain/repositories/IClassroomRepository.js';
import { ClassroomMapper } from '../mappers/ClassroomMapper.js';
import { Op } from 'sequelize';

export class SequelizeClassroomRepository extends IClassroomRepository {
  constructor(classroomModel, classroomTypeModel, featureModel) {
    super();
    this.classroomModel = classroomModel;
    this.classroomTypeModel = classroomTypeModel;
    this.featureModel = featureModel;
  }

  async findById(id) {
    const classroomRecord = await this.classroomModel.findByPk(id, {
      include: [
        { model: this.classroomTypeModel, as: 'classroomType' },
        // { model: this.featureModel, as: 'features', through: { attributes: [] } }
      ]
    });
    return ClassroomMapper.toDomain(classroomRecord);
  }

  async create(classroom) {
    const classroomModel = ClassroomMapper.toModel(classroom);
    const newClassroom = await this.classroomModel.create(classroomModel);

    // Gestionar las características a través de la tabla intermedia
    if (classroom.features && classroom.features.length > 0) {
      await newClassroom.setFeatures(classroom.features.map(f => f.id));
    }

    // Recargar el aula para obtener las características asociadas
    const createdClassroom = await this.classroomModel.findByPk(newClassroom.id, {
      include: [
        { model: this.classroomTypeModel, as: 'type' },
        { model: this.featureModel, as: 'features', through: { attributes: [] } },
      ],
    });

    return ClassroomMapper.toDomain(createdClassroom);
  }

  async update(classroom) {
    const classroomModel = ClassroomMapper.toModel(classroom);
    await this.classroomModel.update(classroomModel, {
      where: { id: classroom.id },
    });
    const updatedClassroom = await this.classroomModel.findByPk(classroom.id, {
      include: [
        { model: this.classroomTypeModel, as: 'type' },
        { model: this.featureModel, as: 'features', through: { attributes: [] } },
      ],
    });
    // Gestionar las características a través de la tabla intermedia
    if (classroom.features && classroom.features.length > 0) {
      await updatedClassroom.setFeatures(classroom.features.map((f) => f.id));
    } else {
      await updatedClassroom.setFeatures([]); // Eliminar todas las características si no hay nuevas
    }
    return ClassroomMapper.toDomain(updatedClassroom);
  }
  // ... otros métodos (findAll, delete, etc.)
  async findAll() {
    const classroomRecords = await this.classroomModel.findAll({
      include: [
        { model: this.classroomTypeModel, as: 'type' },
        { model: this.featureModel, as: 'features', through: { attributes: [] } }
      ]
    });
    return classroomRecords.map(ClassroomMapper.toDomain);
  }

  async delete(id) {
    await this.classroomModel.destroy({ where: { id } });
  }

  async findByBlockAndNumber(block, classroomNumber) {
    const classroomRecord = await this.classroomModel.findOne({
      where: { block, classroomNumber },
      include: [
        { model: this.classroomTypeModel, as: 'type' },
        { model: this.featureModel, as: 'features', through: { attributes: [] } }
      ]
    });
    return ClassroomMapper.toDomain(classroomRecord);
  }

  async save(classroom) {
    if (classroom.id) {
      return this.update(classroom);
    } else {
      return this.create(classroom);
    }
  }
}
