import { ISensorRepository } from "../../domain/repositories/ISensorRepository.js";
import { SensorMapper } from "../mappers/SensorMapper.js";
import { Op } from 'sequelize'; // Necesario para algunas consultas

export class SequelizeSensorRepository extends ISensorRepository {
    constructor(sensorModel, classroomModel) {
        super();
        this.sensorModel = sensorModel;
        this.classroomModel = classroomModel;
    }

    _includeRelations() {
        return [
            { model: this.classroomModel, as: 'classroom' } // Asume alias 'classroom' definido en associations.js
        ];
    }

    async create(sensor) {
        const sensorData = SensorMapper.toModel(sensor);
        const createdModel = await this.sensorModel.create(sensorData);
        // Recargar para incluir relaciones si es necesario mapear de vuelta
        await createdModel.reload({ include: this._includeRelations() });
        return SensorMapper.toDomain(createdModel);
    }

    async findAll() {
        const sensorModels = await this.sensorModel.findAll({
            include: this._includeRelations()
        });
        return sensorModels.map(SensorMapper.toDomain);
    }

    async update(sensor) {
        const sensorModel = await this.sensorModel.findByPk(sensor.id);
        if (!sensorModel) {
            return null; // O lanzar un error NotFoundError
        }
        const sensorData = SensorMapper.toModel(sensor);
        delete sensorData.id; // No intentar actualizar el ID

        await sensorModel.update(sensorData);
        await sensorModel.reload({ include: this._includeRelations() });
        return SensorMapper.toDomain(sensorModel);
    }

    // Asumiendo que delete recibe el ID del sensor a eliminar
    async delete(sensorId) {
        const result = await this.sensorModel.destroy({
            where: { id: sensorId }
        });
        return result > 0; // Devuelve true si se eliminó al menos una fila
    }

    async findById(id) {
        const sensorModel = await this.sensorModel.findByPk(id, {
            include: this._includeRelations()
        });
        return SensorMapper.toDomain(sensorModel);
    }

    async findByClassroomId(classroomId) {
        const sensorModels = await this.sensorModel.findAll({
            where: { classroom_id: classroomId },
            include: this._includeRelations()
        });
        return sensorModels.map(SensorMapper.toDomain);
    }

    // Asume que el modelo SensorModel tiene un campo ENUM 'status'
    async findActiveSensors() {
        const sensorModels = await this.sensorModel.findAll({
            where: { status: 'activo' }, // Usa el valor ENUM 'activo'
            include: this._includeRelations()
        });
        return sensorModels.map(SensorMapper.toDomain);
    }

    // Asume que el modelo SensorModel tiene un campo ENUM 'status'
    async findInactiveSensors() {
        const sensorModels = await this.sensorModel.findAll({
            where: { status: 'inactivo' }, // Usa el valor ENUM 'inactivo'
            include: this._includeRelations()
        });
        return sensorModels.map(SensorMapper.toDomain);
    }

    // Asume que 'status' es uno de los valores ENUM ('activo', 'inactivo', 'mantenimiento')
    async updateSensorStatus(sensorId, status) {
        // Opcional: Validar que el status sea uno de los valores permitidos
        const allowedStatus = ['activo', 'inactivo', 'mantenimiento'];
        if (!allowedStatus.includes(status)) {
            throw new Error(`Valor de estado inválido: ${status}. Debe ser uno de ${allowedStatus.join(', ')}`);
        }

        const [affectedRows] = await this.sensorModel.update(
            { status: status }, // Actualiza el campo 'status' con el valor ENUM
            { where: { id: sensorId } }
        );
        return affectedRows > 0; // Devuelve true si se actualizó al menos una fila
    }
}