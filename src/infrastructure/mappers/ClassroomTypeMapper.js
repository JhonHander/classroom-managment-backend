import  ClassroomType  from '../../domain/entities/ClassroomType.js';

export class ClassroomTypeMapper {

    /**
     * Maps a ClassroomTypeModel to a ClassroomType domain entity.
     * @param {Object} classroomTypeModel - The ClassroomTypeModel object to map.
     * @returns {ClassroomType} - The mapped ClassroomType domain entity.
     */

    static toDomain(classroomTypeModel) {

        if (!classroomTypeModel) return null;

        return new ClassroomType({
            id: classroomTypeModel.id,
            name: classroomTypeModel.name,
        });
    }


    /**
     * Maps a ClassroomType domain entity to a ClassroomTypeModel.
     * @param {ClassroomType} classroomType - The ClassroomType domain entity to map.
     * @returns {Object} - The mapped ClassroomTypeModel.
     */

    static toModel(classroomType) {

        if (!classroomType) return null;

        return {
            id: classroomType.id,
            name: classroomType.name,
        };
    }
}