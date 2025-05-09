/** 
    * CreateReservationUseCase.js
    * Use case for creating a reservation.
    * Modified to use classroom fullName instead of ID and user email instead of ID.
*/

class CreateReservationUseCase {
    constructor(reservationRepository, classroomRepository, userRepository) {
        this.reservationRepository = reservationRepository;
        this.classroomRepository = classroomRepository;
        this.userRepository = userRepository;
    }

    async execute({ email, classroomFullName, date, startHour, finishHour }) {
        // Step 1: Check if the user exists by email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }

        // Step 2: Check if the classroom exists by fullName
        const classroom = await this.classroomRepository.findOne(classroomFullName);
        if (!classroom) {
            throw new Error(`Classroom with fullName "${classroomFullName}" not found`);
        }

        // Step 3: Check if the user already has an active reservation
        const activeReservation = await this.reservationRepository.findActiveByUserId(user.id);
        if (activeReservation) {
            throw new Error(`User already has an active reservation. Only one active reservation per user is allowed.`);
        }

        // Step 4: Create a new reservation with 'pending' status (id: 1)
        const reservation = {
            userId: user.id, // Usamos el ID del usuario que obtuvimos de la búsqueda por email
            classroomId: classroom.id, // Usamos el ID del aula que obtuvimos de la búsqueda por fullName
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