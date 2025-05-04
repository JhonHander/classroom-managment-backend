import Reservation from '../../domain/entities/Reservation.js';
import { UserMapper } from './UserMapper.js';
import { ClassroomMapper } from './ClassroomMapper.js';
import { ReservationStatusMapper } from './ReservationStatusMapper.js';

export class ReservationMapper {

    /**
     * Maps a ReservationModel to a Reservation domain entity.
     * @param {Object} reservationModel - The ReservationModel object to map.
     * @return {Reservation} - The mapped Reservation domain entity.
     * */

    static toDomain(reservationModel) {
        if (!reservationModel) return null;

        const user = reservationModel.user ? UserMapper.toDomain(reservationModel.user) : null; // Mapeo del usuario
        const classroom = reservationModel.classroom ? ClassroomMapper.toDomain(reservationModel.classroom) : null; // Mapeo del aula
        const reservationStatus = reservationModel.reservationStatus ? ReservationStatusMapper.toDomain(reservationModel.reservationStatus) : null; // Mapeo del estado de la reserva

        switch (true) {
            case !user:
                throw new Error('User not found in reservation model');
            case !classroom:
                throw new Error('Classroom not found in reservation model');
            case !reservationStatus:
                throw new Error('ReservationStatus not found in reservation model');
        }
        // Si no se lanza ninguna excepción, se procede a crear la instancia de Reservation


        return new Reservation({
            id: reservationModel.id,
            user: user, // Mapeo del usuario
            classroom: classroom, // Mapeo del aula
            reservationStatus: reservationStatus, // Mapeo del estado de la reserva
            date: reservationModel.date,
            startHour: reservationModel.startHour,
            finishHour: reservationModel.finishHour,
            // tokenQr: reservationModel.tokenQr,
            // dateExpiration: reservationModel.dateExpiration,
        });
    }

    /**
     * Maps a Reservation domain entity to a ReservationModel.
     * @param {Reservation} reservation - The Reservation domain entity to map.
     * @return {Object} - The mapped ReservationModel.
     * */

    static toModel(reservation) {
        return {
            id: reservation.id,
            userId: reservation.user ? reservation.user.id : null, // ID del usuario
            classroomId: reservation.classroom ? reservation.classroom.id : null, // ID del aula
            reservationStatusId: reservation.reservationStatus ? reservation.reservationStatus.id : null, // ID del estado de la reserva
            date: reservation.date,
            startHour: reservation.startHour,
            finishHour: reservation.finishHour,
            // tokenQr: reservation.tokenQr,
            // dateExpiration: reservation.dateExpiration,
        };
    }
}