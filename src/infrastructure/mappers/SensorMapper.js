import Sensor from '../../domain/entities/Sensor.js';
import { ClassroomMapper } from './ClassroomMapper.js';

export class SensorMapper {

    /**
     * Maps a SensorModel to a Sensor domain entity.
     * @param {Object} SensorModel - The SensorModel object to map.
     * @returns {Sensor} - The mapped Sensor domain entity.
     * */

    static toDomain(SensorModel) {
        if (!SensorModel) return null;
        const classroom = ClassroomMapper.toDomain(SensorModel.classroom);

        return new Sensor({
            id: SensorModel.id,
            classroom: classroom,
            status: SensorModel.status
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
            classroomId: sensor.classroom.id,
            status: sensor.status
        };
    }
}