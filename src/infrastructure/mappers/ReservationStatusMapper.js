import { ReservationStatus } from '../../domain/entities/ReservationStatus.js';

export class ReservationStatusMapper {

    /**
     * Maps a ReservationStatusModel to a ReservationStatus domain entity.
     * @param {Object} reservationStatusModel - The ReservationStatusModel object to map.
     * @returns {ReservationStatus} - The mapped ReservationStatus domain entity.
     */

    static toDomain(reservationStatusModel) {
        if (!reservationStatusModel) return null;

        return new ReservationStatus({
            id: reservationStatusModel.id,
            name: reservationStatusModel.name,
        });
    }


    /**
     * Maps a ReservationStatus domain entity to a ReservationStatusModel.
     * @param {ReservationStatus} reservationStatus - The ReservationStatus domain entity to map.
     * @return {Object} - The mapped ReservationStatusModel.
     */

    static toModel(reservationStatus) {
        return {
            id: reservationStatus.id,
            name: reservationStatus.name,
        };
    }
}