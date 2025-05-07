import Classroom from '../../domain/entities/Classroom.js';
// Importa los mappers específicos para las asociaciones
import { ClassroomTypeMapper } from './ClassroomTypeMapper.js';
// import { ClassroomFeatureMapper } from './ClassroomFeatureMapper.js';

export class ClassroomMapper {

  /**
   * Maps a ClassroomModel to a Classroom domain entity.
   * @param {Object} classroomModel - The ClassroomModel object to map.
   * @returns {Classroom} - The mapped Classroom domain entity.
   */

  static toDomain(classroomModel) {
    if (!classroomModel) return null;

    // Mapeo del tipo de aula usando el objeto asociado 'classroomType' (alias)
    const classroomType = classroomModel.classroomType ? ClassroomTypeMapper.toDomain(classroomModel.classroomType) : null;

    if (!classroomType) {
      throw new Error('ClassroomType not found in classroom model');
    }
    // // Mapeo de las características usando el array asociado 'features' (alias)
    // const features = classroomModel.features ? classroomModel.features.map(ClassroomFeatureMapper.toDomain) : [];

    return new Classroom({
      id: classroomModel.id,
      classroomType: classroomType, // Pasa el objeto ClassroomType mapeado
      block: classroomModel.block,
      classroomNumber: classroomModel.classroomNumber,
      classroomFullName: classroomModel.classroomFullName, // Pasamos el valor generado por la BD
      capacity: classroomModel.capacity
    });
  }


  /**
   * Maps a Classroom domain entity to a ClassroomModel.
   * @param {Classroom} classroom - The Classroom domain entity to map.
   * @return {Object} - The mapped ClassroomModel.
   */

  static toModel(classroom) {
    // Al guardar/actualizar, generalmente solo necesitas el ID de la relación
    return {
      id: classroom.id,
      classroomTypeId: classroom.type ? classroom.type.id : null, // Usa el ID del tipo para la FK
      block: classroom.block,
      classroomNumber: classroom.number,
      // No incluimos classroomFullName porque es generado por la BD
      capacity: classroom.capacity,
      // Las características (M-N) se manejan por separado (ej: setFeatures) en el repositorio
    };
  }
}