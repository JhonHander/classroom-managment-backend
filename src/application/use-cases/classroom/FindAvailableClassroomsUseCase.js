class FindAvailableClassroomsUseCase {
  constructor(classroomRepository, scheduleRepository, reservationRepository) {
    this.classroomRepository = classroomRepository;
    this.scheduleRepository = scheduleRepository;
    this.reservationRepository = reservationRepository;
  }

  async execute({ date, startHour, endHour, capacity, features }) {
    // console.log('[DEBUG] Params in useCase:', { date, startHour, endHour });
    // Step 1: Validate input
    if (!date || !startHour || !endHour) {
      throw new Error('Date, start time and end time are required');
    }

    // Convert date and times to appropriate format for comparison
    const searchDate = new Date(date);
    const dayOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][searchDate.getDay()];
    
    // Step 2: Get classrooms that don't have reservations for the specified time range
    const availableClassrooms = await this.classroomRepository.getAvailable(
      new Date(`${date}T${startHour}`), 
      new Date(`${date}T${endHour}`)
    );

    if (availableClassrooms.length === 0) {
      return [];
    }

    // Step 3: Filter out classrooms that have scheduled classes
    const available = availableClassrooms.map(classroom => classroom.classroomFullName);
    const classroomsWithSchedules = await this.scheduleRepository.getSchedulesByClassroomIdAndDateAndTime(
      available,
      dayOfWeek,
      startHour,
      endHour
    );

    // IDs of classrooms that have scheduled classes during the requested time
    const scheduledClassroomIds = classroomsWithSchedules.map(schedule => schedule.classroomId);
    
    // Filter out classrooms with scheduled classes
    let filteredClassrooms = availableClassrooms.filter(
      classroom => !scheduledClassroomIds.includes(classroom.id)
    );

    // Step 4: Apply additional filters (capacity, features)
    if (capacity) {
      const minCapacity = parseInt(capacity, 10);
      filteredClassrooms = filteredClassrooms.filter(
        classroom => classroom.capacity >= minCapacity
      );
    }

    if (features && features.length > 0) {
      // This assumes classroom.features is populated and is an array of feature objects
      filteredClassrooms = filteredClassrooms.filter(classroom => {
        // If classroom has no features or features is not loaded, it doesn't match
        if (!classroom.features || !Array.isArray(classroom.features)) {
          return false;
        }
        
        // Check if the classroom has all the required features
        return features.every(requiredFeatureId => 
          classroom.features.some(feature => feature.id === requiredFeatureId)
        );
      });
    }

    // Step 5: Return available classrooms
    return filteredClassrooms;
  }
}

export default FindAvailableClassroomsUseCase;