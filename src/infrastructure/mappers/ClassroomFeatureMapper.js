import ClassroomFeature from '../../domain/entities/ClassroomFeature.js';

export class ClassroomFeatureMapper {

    /**
     * Maps a ClassroomFeatureModel to a ClassroomFeature domain entity.
     * @param {Object} classroomFeatureModel - The ClassroomFeatureModel object to map.
     * @returns {ClassroomFeature} - The mapped ClassroomFeature domain entity.
     */

    static toDomain(classroomFeatureModel) {
        if (!classroomFeatureModel) return null;

        return new ClassroomFeature({
            id: classroomFeatureModel.id,
            name: classroomFeatureModel.name,
        }
        );
    }


    /**
     * Maps a ClassroomFeature domain entity to a ClassroomFeatureModel.
     * @param {ClassroomFeature} classroomFeature - The ClassroomFeature domain entity to map.
     * @returns {Object} - The mapped ClassroomFeatureModel.
     */

    static toModel(classroomFeature) {
        if (!classroomFeature) return null;

        return {
            id: classroomFeature.id,
            name: classroomFeature.name,
        };
    }
}