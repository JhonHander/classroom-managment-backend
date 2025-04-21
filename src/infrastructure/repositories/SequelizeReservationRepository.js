import { IReservationRepository } from '../../domain/repositories/IReservationRepository.js';
import { ReservationMapper } from '../mappers/ReservationMapper.js';
import { Op } from 'sequelize'; // Necesario para consultas complejas

export class SequelizeReservationRepository extends IReservationRepository {
    constructor(reservationModel, userModel, classroomModel, reservationStatusModel) {
        super();
        this.reservationModel = reservationModel;
        this.userModel = userModel;
        this.classroomModel = classroomModel;
        this.reservationStatusModel = reservationStatusModel;
    }

    _includeRelations() {
        return [
            { model: this.userModel, as: 'user', attributes: { exclude: ['password'] } }, // Excluir password
            { model: this.classroomModel, as: 'classroom' },
            { model: this.reservationStatusModel, as: 'reservationStatus' }
        ];
    }


    async create(reservation) {
        const reservationData = ReservationMapper.toModel(reservation);
        // Asegúrate de que el estado inicial se establece si no viene en la entidad
        // if (!reservationData.reservation_status_id) {
        //   reservationData.reservation_status_id = ID_ESTADO_PENDIENTE; // O el estado por defecto
        // }
        const createdModel = await this.reservationModel.create(reservationData);
        await createdModel.reload({ include: this._includeRelations() });
        return ReservationMapper.toDomain(createdModel);
    }

    async findAll() {
        const reservationModels = await this.reservationModel.findAll({
            include: this._includeRelations(),
            order: [['start_time', 'DESC']] // Opcional: ordenar
        });
        return reservationModels.map(ReservationMapper.toDomain);
    }

    async update(reservation) {
        const reservationModel = await this.reservationModel.findByPk(reservation.id);
        if (!reservationModel) {
            return null; // O lanzar error
        }
        const reservationData = ReservationMapper.toModel(reservation);
        delete reservationData.id; // No actualizar el ID

        await reservationModel.update(reservationData);
        await reservationModel.reload({ include: this._includeRelations() });
        return ReservationMapper.toDomain(reservationModel);
    }

    async delete(id) { // Asumiendo que se pasa el ID
        const result = await this.reservationModel.destroy({
            where: { id: id }
        });
        return result > 0;
    }

    async findById(id) {
        const reservationModel = await this.reservationModel.findByPk(id, {
            include: this._includeRelations()
        });
        return ReservationMapper.toDomain(reservationModel);
    }

    async findByUserId(userId) {
        const reservationModels = await this.reservationModel.findAll({
            where: { user_id: userId },
            include: this._includeRelations(),
            order: [['start_time', 'DESC']]
        });
        return reservationModels.map(ReservationMapper.toDomain);
    }

    async findByClassroomId(classroomId) {
        const reservationModels = await this.reservationModel.findAll({
            where: { classroom_id: classroomId },
            include: this._includeRelations(),
            order: [['start_time', 'DESC']]
        });
        return reservationModels.map(ReservationMapper.toDomain);
    }

    async findByDate(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const reservationModels = await this.reservationModel.findAll({
            where: {
                start_time: { // O la columna de fecha relevante
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            include: this._includeRelations(),
            order: [['start_time', 'ASC']]
        });
        return reservationModels.map(ReservationMapper.toDomain);
    }

    async findByDateAndClassroomId(date, classroomId) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const reservationModels = await this.reservationModel.findAll({
            where: {
                classroom_id: classroomId,
                start_time: { // O la columna de fecha relevante
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            include: this._includeRelations(),
            order: [['start_time', 'ASC']]
        });
        return reservationModels.map(ReservationMapper.toDomain);
    }

    async findByStartAndFinishAndClassroomId(start, finish, classroomId) {
        // Encuentra reservas que se solapan con el rango [start, finish)
        const reservationModels = await this.reservationModel.findAll({
            where: {
                classroom_id: classroomId,
                start_time: { [Op.lt]: finish }, // La reserva empieza antes de que termine el rango
                end_time: { [Op.gt]: start }    // La reserva termina después de que empiece el rango
            },
            include: this._includeRelations()
        });
        return reservationModels.map(ReservationMapper.toDomain);
    }

    async validateTokenQr(token) {
        const count = await this.reservationModel.count({
            where: { qr_token: token } // Asume que tienes un campo qr_token
        });
        return count > 0;
    }

    async findByTokenQr(token) {
        const reservationModel = await this.reservationModel.findOne({
            where: { qr_token: token }, // Asume que tienes un campo qr_token
            include: this._includeRelations()
        });
        return ReservationMapper.toDomain(reservationModel);
    }

    async findByUserIdAndDate(userId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const reservationModels = await this.reservationModel.findAll({
            where: {
                user_id: userId,
                start_time: { // O la columna de fecha relevante
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            include: this._includeRelations(),
            order: [['start_time', 'ASC']]
        });
        return reservationModels.map(ReservationMapper.toDomain);
    }
}