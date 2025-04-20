import { Schedule } from '../../domain/entities/Schedule.js';
import { ClassroomMapper } from './ClassroomMapper.js';

export class ScheduleMapper {

    /**
     * Maps a ScheduleModel to a Schedule domain entity.
     * @param {Object} scheduleModel - The ScheduleModel object to map.
     * @returns {Schedule} - The mapped Schedule domain entity.
     */

    static toDomain(scheduleModel) {
        if (!scheduleModel) return null;

        const classroom = scheduleModel.classroom ? ClassroomMapper.toDomain(scheduleModel.classroom) : null;
        if (!classroom) {
            throw new Error('Classroom not found in schedule model');
        }

        return new Schedule({
            id: scheduleModel.id,
            classroom: classroom,
            day: scheduleModel.day,
            startTime: scheduleModel.startHour,
            endTime: scheduleModel.finishHour,
        });
    }


    /**
     * Maps a Schedule domain entity to a ScheduleModel.
     * @param {Schedule} schedule - The Schedule domain entity to map.
     * @return {Object} - The mapped ScheduleModel.
     */

    static toModel(schedule) {
        return {
            id: schedule.id,
            classroomId: schedule.classroom.id,
            day: schedule.day,
            startHour: schedule.startHour,
            finishHour: schedule.finishHour,
        };
    }
}