import { Reservation } from '../../domain/entities/Reservation.js';
import { ApplicationError } from '../../shared/errors/ApplicationError.js'; // Podrías tener errores custom

export class CreateReservationUseCase {
    // Inyecta las INTERFACES de repositorio necesarias
    constructor(reservationRepository, classroomRepository, userRepository, scheduleRepository) {
        this.reservationRepository = reservationRepository;
        this.classroomRepository = classroomRepository;
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository; // Para verificar horarios fijos
    }

    async execute({ userId, classroomId, date, startTime, endTime }) {
        // 1. Validación de Entrada (básica)
        if (!userId || !classroomId || !date || !startTime || !endTime) {
            throw new ApplicationError('Faltan datos requeridos para la reserva.', 400);
        }
        const reservationStartTime = new Date(`${date}T${startTime}`);
        const reservationEndTime = new Date(`${date}T${endTime}`);
        if (reservationStartTime >= reservationEndTime) {
             throw new ApplicationError('La hora de inicio debe ser anterior a la hora de fin.', 400);
        }
        // Podrías añadir validación de formato de hora/fecha

        // 2. Validaciones de Negocio (usando repositorios)
        const classroom = await this.classroomRepository.findById(classroomId);
        if (!classroom) {
            throw new ApplicationError(`Aula con ID ${classroomId} no encontrada.`, 404);
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new ApplicationError(`Usuario con ID ${userId} no encontrado.`, 404);
        }
        // Aquí podrías verificar el rol del usuario si hay restricciones

        // Verificar conflictos con otras reservas
        const conflictingReservations = await this.reservationRepository.findConflicts(classroomId, reservationStartTime, reservationEndTime);
        if (conflictingReservations.length > 0) {
            throw new ApplicationError('El aula ya está reservada en ese horario.', 409); // 409 Conflict
        }

        // Verificar conflictos con horarios fijos (si aplica)
        const dayOfWeek = reservationStartTime.toLocaleString('es-ES', { weekday: 'long' }); // Ajustar locale si es necesario
        const conflictingSchedules = await this.scheduleRepository.findConflicts(classroomId, dayOfWeek, startTime, endTime);
         if (conflictingSchedules.length > 0) {
            throw new ApplicationError('El aula tiene una clase programada en ese horario.', 409);
        }

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
            qrToken: null, // O generar token
            expirationDate: null // O calcular expiración si es 'pendiente'
        });

        // 4. Persistir usando el Repositorio
        const createdReservation = await this.reservationRepository.save(newReservation);

        // 5. Retornar el resultado
        return createdReservation; // Devuelve la entidad de dominio creada
    }
}