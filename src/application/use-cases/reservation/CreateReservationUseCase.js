/** 
    * CreateReservationUseCase.js
    * Use case for creating a reservation.
    * This use case handles the logic for creating a reservation, including validation and checking availability.
*/
import Reservation from '../../../domain/entities/Reservation.js';
// import { ApplicationError } from '../../../shared/errors/ApplicationError.js'; // Podrías tener errores custom

class CreateReservationUseCase {
    constructor(reservationRepository, classroomRepository, userRepository, findAvailableClassroomsUseCase) {
        this.reservationRepository = reservationRepository;
        this.classroomRepository = classroomRepository;
        this.userRepository = userRepository;
        this.findAvailableClassroomsUseCase = findAvailableClassroomsUseCase;
    }

    async execute({ userId, classroomId, date, startHour, finishHour, purpose = null }) {
        // Step 1: Basic validation
        if (!userId || !classroomId || !date || !startHour || !finishHour) {
            throw new Error('User ID, classroom ID, date, start hour and finish hour are required');
        }

        // Step 2: Validate the time range
        if (startHour >= finishHour) {
            throw new Error('Start hour must be before finish hour');
        }

        // Step 3: Check if the user exists
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }
        // Aquí podrías verificar el rol del usuario si hay restricciones

        // Verificar conflictos con otras reservas
        // const conflictingReservations = await this.reservationRepository.findConflicts(classroomId, reservationStartTime, reservationEndTime);
        // if (conflictingReservations.length > 0) {
        //     throw new ApplicationError('El aula ya está reservada en ese horario.', 409); // 409 Conflict
        // }

        // Verificar conflictos con horarios fijos (si aplica)
        // const dayOfWeek = reservationStartTime.toLocaleString('es-ES', { weekday: 'long' }); // Ajustar locale si es necesario
        // const conflictingSchedules = await this.scheduleRepository.findConflicts(classroomId, dayOfWeek, startTime, endTime);
        //  if (conflictingSchedules.length > 0) {
        //     throw new ApplicationError('El aula tiene una clase programada en ese horario.', 409);
        // }

        // 3. Crear la Entidad de Dominio
        // Asume un estado inicial (ej. 'pendiente' o 'confirmada' dependiendo de tus reglas)
        const statusId = 1; // ID del estado 'pendiente' o 'confirmada'
        const newReservation = new Reservation({
            id: null, // ID será asignado por la BD
            userId: userId,
            classroomId: classroomId,
            date: date,
            startTime: startTime,
            endTime: endTime,
            statusId: statusId, // Estado inicial
            // Podrías generar un token QR aquí si es necesario
            // qrToken: null, // O generar token
            // expirationDate: null // O calcular expiración si es 'pendiente'
        });

        // Step 7: Save the reservation
        const createdReservation = await this.reservationRepository.create(reservation);

        // Step 8: Return the reservation with user and classroom details
        return {
            ...createdReservation,
            user,
            classroom
        };
    }
}

export default CreateReservationUseCase;