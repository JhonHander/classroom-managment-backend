/** 
    * CreateReservationUseCase.js
    * Use case for creating a reservation.
    * Simplified version with validations moved to DTO.
*/

class CreateReservationUseCase {
    constructor(reservationRepository, classroomRepository, userRepository) {
        this.reservationRepository = reservationRepository;
        this.classroomRepository = classroomRepository;
        this.userRepository = userRepository;
    }

    async execute({ userId, classroomId, date, startHour, finishHour }) {
        // Step 1: Check if the user exists
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }

        // Step 2: Check if the classroom exists
        const classroom = await this.classroomRepository.findById(classroomId);
        if (!classroom) {
            throw new Error(`Classroom with ID ${classroomId} not found`);
        }

        // Step 3: Check if the user already has an active reservation
        const activeReservation = await this.reservationRepository.findActiveByUserId(userId);
        if (activeReservation) {
            throw new Error(`User already has an active reservation. Only one active reservation per user is allowed.`);
        }

        // Step 4: Create a new reservation with 'pending' status (id: 1)
        const reservation = {
            userId,
            classroomId,
            date: new Date(date),
            startHour,
            finishHour,
            reservationStatusId: 1, // 'pending' status
        };

        // Step 5: Save the reservation
        const createdReservation = await this.reservationRepository.create(reservation);

        // Step 6: Return the reservation with user and classroom details
        return {
            ...createdReservation,
            user,
            classroom
        };
    }
}

export default CreateReservationUseCase;