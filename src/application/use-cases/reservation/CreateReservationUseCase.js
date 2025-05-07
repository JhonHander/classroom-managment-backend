/** 
    * CreateReservationUseCase.js
    * Use case for creating a reservation.
    * This use case handles the logic for creating a reservation, including validation and checking availability.
*/

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

        // Step 4: Check if the classroom exists
        const classroom = await this.classroomRepository.findById(classroomId);
        if (!classroom) {
            throw new Error(`Classroom with ID ${classroomId} not found`);
        }

        // Step 5: Check if the classroom is available using FindAvailableClassroomsUseCase
        const availableClassrooms = await this.findAvailableClassroomsUseCase.execute({
            date: date,
            startTime: startHour,
            endTime: finishHour,
        });

        // Check if the requested classroom is in the list of available classrooms
        const isAvailable = availableClassrooms.some(c => c.id === classroomId);
        if (!isAvailable) {
            throw new Error(`Classroom ${classroom.fullName} is not available at the specified time`);
        }

        // Step 6: Create the reservation
        const reservation = {
            userId,
            classroomId,
            date: new Date(date),
            startHour,
            finishHour,
            status: 1, // Assuming 1 is "Pending" status
            purpose
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