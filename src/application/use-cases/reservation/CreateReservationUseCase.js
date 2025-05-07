import { ApplicationError } from '../../../shared/errors/ApplicationError.js'; // Podrías tener errores custom

/** 
    * CreateReservationUseCase.js
    * Use case for creating a reservation.
    * This use case handles the logic for creating a reservation, including validation and checking availability.
*/

class CreateReservationUseCase {
    constructor(reservationRepository, classroomRepository, userRepository) {
        this.reservationRepository = reservationRepository;
        this.classroomRepository = classroomRepository;
        this.userRepository = userRepository;
    }

    async execute({ userId, classroomId, date, startHour, finishHour }) {
        // Step 1: Basic validation
        if (!userId || !classroomId || !date || !startHour || !finishHour) {
            throw new ApplicationError('User ID, classroom ID, date, start hour and finish hour are required', 400);
        }

        // Step 2: Validate the time range
        if (startHour >= finishHour) {
            throw new ApplicationError('Start hour must be before finish hour', 400);
        }

        // Step 3: Check if the user exists
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new ApplicationError(`User with ID ${userId} not found`, 404);
        }

        // Step 4: Check if the classroom exists
        const classroom = await this.classroomRepository.findById(classroomId);
        if (!classroom) {
            throw new ApplicationError(`Classroom with ID ${classroomId} not found`, 404);
        }

        // Step 5: Check if the classroom is available at the specified time
        const reservationDate = new Date(date);
        const isAvailable = await this.reservationRepository.isClassroomAvailable(
            classroomId,
            reservationDate,
            startHour,
            finishHour
        );

        if (!isAvailable) {
            throw new ApplicationError(`Classroom ${classroom.fullName} is not available at the specified time`, 409);
        }

        // Step 6: Create the reservation
        const reservation = {
            user,
            classroom,
            date: reservationDate,
            startHour,
            finishHour,
            status: 1, // Assuming 1 is "Pending" status
        };

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