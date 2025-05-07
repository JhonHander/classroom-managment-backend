import IScheduleRepository from '../../domain/repositories/IScheduleRepository.js'; // Asegúrate que existe
import { ScheduleMapper } from '../mappers/ScheduleMapper.js'; // Asegúrate que existe
import { Op } from 'sequelize';

export class SequelizeScheduleRepository extends IScheduleRepository {
    constructor(scheduleModel, classroomModel) {
        super();
        this.scheduleModel = scheduleModel;
        this.classroomModel = classroomModel; // Si necesitas incluir el aula
    }

    _includeRelations() {
        return [
            // Incluye el aula si la entidad Schedule la necesita
            { model: this.classroomModel, as: 'classroom' }
        ];
    }

    async create(schedule) {
        const scheduleData = ScheduleMapper.toModel(schedule);
        const createdModel = await this.scheduleModel.create(scheduleData);
        await createdModel.reload({ include: this._includeRelations() });
        return ScheduleMapper.toDomain(createdModel);
    }

    async findById(id) {
        const scheduleModel = await this.scheduleModel.findByPk(id, {
            include: this._includeRelations()
        });
        return ScheduleMapper.toDomain(scheduleModel);
    }

    async findByClassroomId(classroomId) {
        const scheduleModels = await this.scheduleModel.findAll({
            where: { classroomId: classroomId },
            include: this._includeRelations(),
            order: [['day_of_week', 'ASC'], ['start_time', 'ASC']] // Ejemplo de orden
        });
        return scheduleModels.map(ScheduleMapper.toDomain(scheduleModels)); // TENGO QUE CORREGIR ESTO
    }

    async findAll({ classroomId, dayOfWeek }) {
        const whereClause = {};

        if (classroomId) {
            whereClause.classroomId = classroomId;
        }

        if (dayOfWeek) {
            whereClause.dayOfWeek = dayOfWeek;
        }

        const scheduleModels = await this.scheduleModel.findAll({
            where: whereClause,
            include: this._includeRelations(),
            order: [['day_of_week', 'ASC'], ['start_time', 'ASC']] // Ejemplo de orden
        });

        return scheduleModels.map(ScheduleMapper.toDomain);
    }

    async update(schedule) {
        const scheduleModel = await this.scheduleModel.findByPk(schedule.id);
        if (!scheduleModel) return null;

        const scheduleData = ScheduleMapper.toModel(schedule);
        delete scheduleData.id;

        await scheduleModel.update(scheduleData);
        await scheduleModel.reload({ include: this._includeRelations() });
        return ScheduleMapper.toDomain(scheduleModel);
    }

    async delete(id) {
        const result = await this.scheduleModel.destroy({
            where: { id: id }
        });
        return result > 0;
    }

    // Implementa otros métodos definidos en IScheduleRepository...
}