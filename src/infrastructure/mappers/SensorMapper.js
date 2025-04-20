import { Sensor } from '../../domain/entities/Sensor.js';

export class SensorMapper {

    /**
     * Maps a SensorModel to a Sensor domain entity.
     * @param {Object} SensorModel - The SensorModel object to map.
     * @returns {Sensor} - The mapped Sensor domain entity.
     * */

    static toDomain(SensorModel) {
        if (!SensorModel) return null;

        return new Sensor({
            id: SensorModel.id,
            name: SensorModel.name,
            classroomId: SensorModel.classroomId,
            classroomFullName: SensorModel.classroomFullName,
            classroomNumber: SensorModel.classroomNumber,
            classroomBlock: SensorModel.classroomBlock,
            classroomTypeId: SensorModel.classroomTypeId,
            classroomTypeName: SensorModel.classroomTypeName,
        });
    }


    /**
     * Maps a Sensor domain entity to a SensorModel.
     * @param {Sensor} sensor - The Sensor domain entity to map.
     * @return {Object} - The mapped SensorModel.
     * */

    static toModel(sensor) {
        if (!sensor) return null;

        return {
            id: sensor.id,
            name: sensor.name,
            classroomId: sensor.classroomId,
            classroomFullName: sensor.classroomFullName,
            classroomNumber: sensor.classroomNumber,
            classroomBlock: sensor.classroomBlock,
            classroomTypeId: sensor.classroomTypeId,
            classroomTypeName: sensor.classroomTypeName,
        };
    }
}