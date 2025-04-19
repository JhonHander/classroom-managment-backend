import { Classroom } from '../../domain/entities/Classroom.js';
import { ClassroomType } from '../../domain/entities/ClassroomType.js'; //  Asumiendo que tienes esta entidad
import { ClassroomFeature } from '../../domain/entities/ClassroomFeatures.js'; // Asumiendo que tienes esta entidad

export class ClassroomMapper {
  static toDomain(classroomModel) {
    if (!classroomModel) {
      return null;
    }

    // Mapeo del tipo de aula
    const classroomType = classroomModel.classroomTypeId ? new ClassroomType(
      classroomModel.type.id,
      classroomModel.type.name,
    ) : null;

    // Mapeo de las características
    const features = classroomModel.features ? classroomModel.features.map(featureModel => new ClassroomFeature(
      featureModel.id,
      featureModel.name, 
    )) : [];

    return new Classroom(
      classroomModel.id,
      classroomType,
      classroomModel.block,
      classroomModel.classroomNumber,
      classroomModel.classroomFullName,
      classroomModel.qrCode,
      classroomModel.capacity,
    );
  }

  static toModel(classroom) {
    return {
      id: classroom.id,
      classroomTypeId: classroom.type ? classroom.type.id : null,
      block: classroom.block,
      classroomNumber: classroom.number,
      classroomFullName: classroom.fullName,
      qrCode: classroom.qrCode,
      capacity: classroom.capacity,
      //  Las features se manejan en el repositorio, no directamente en el modelo
    };
  }
}


// import { Classroom } from '../../domain/entities/Classroom.js';

// export class ClassroomMapper {
//   static toDomain(classroomModel) {
//     if (!classroomModel) {
//       return null;
//     }
//     return new Classroom(
//       classroomModel.id,
//       classroomModel.block,
//       classroomModel.classroomNumber,
//       classroomModel.qr_code,
//       classroomModel.capacity,
//       classroomModel.classroomFullName,
//       classroomModel.type, //  Asumo que ya viene como objeto ClassroomType
//       classroomModel.features // Asumo que ya viene como array de Features
//     );
//   }

//   static toModel(classroom) {
//     return {
//       id: classroom.id,
//       block: classroom.block,
//       classroomNumber: classroom.classroomNumber,
//       // ... otros campos
//       typeId: classroom.type.id //  Asumo que 'type' es un objeto ClassroomType con 'id'
//       //  Las features se manejarían en una tabla intermedia, no directamente en el modelo
//     };
//   }
// }