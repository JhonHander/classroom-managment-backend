class GetClassroomAnalyticsUseCase {
  constructor(reservationRepository, sensorRepository, classroomRepository) {
    this.reservationRepository = reservationRepository;
    this.sensorRepository = sensorRepository;
    this.classroomRepository = classroomRepository;
  }

  async execute({ fromDate, toDate, classroomIds = [], blockId = null }) {
    // Step 1: Prepare date range (default to last 30 days if not specified)
    const endDate = toDate ? new Date(toDate) : new Date();
    const startDate = fromDate 
      ? new Date(fromDate) 
      : new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago

    // Step 2: Get classrooms to analyze
    let classrooms = [];
    if (classroomIds && classroomIds.length > 0) {
      // Get specific classrooms
      classrooms = await Promise.all(
        classroomIds.map(id => this.classroomRepository.findById(id))
      );
      classrooms = classrooms.filter(c => c !== null); // Filter out any not found
    } else if (blockId) {
      // Get classrooms in a specific block
      classrooms = await this.classroomRepository.findByBlock(blockId);
    } else {
      // Get all classrooms
      classrooms = await this.classroomRepository.findAll({});
    }

    if (classrooms.length === 0) {
      throw new Error('No classrooms found for the analysis');
    }

    // Step 3: Get reservation statistics for each classroom
    const reservationStats = await Promise.all(
      classrooms.map(classroom => 
        this.reservationRepository.getReservationStats(classroom.id, startDate, endDate)
      )
    );

    // Step 4: Get sensor data statistics for each classroom (if sensor repository is available)
    let occupancyStats = [];
    if (this.sensorRepository) {
      occupancyStats = await Promise.all(
        classrooms.map(classroom => 
          this.sensorRepository.getOccupancyStats(classroom.id, startDate, endDate)
        )
      );
    }

    // Step 5: Combine the statistics for each classroom
    const analytics = classrooms.map((classroom, index) => {
      const reservationStat = reservationStats[index] || { 
        totalReservations: 0, 
        approvedReservations: 0,
        rejectedReservations: 0,
        pendingReservations: 0,
        totalHoursReserved: 0,
        uniqueUsers: 0
      };
      
      const occupancyStat = occupancyStats[index] || {
        averageOccupancy: 0,
        maxOccupancy: 0,
        utilizationRate: 0,
        emptyHours: 0,
        fullHours: 0
      };

      return {
        classroomId: classroom.id,
        classroomFullName: classroom.fullName,
        block: classroom.block,
        type: classroom.type,
        capacity: classroom.capacity,
        reservations: reservationStat,
        occupancy: occupancyStat
      };
    });

    // Step 6: Calculate overall statistics
    const overallStats = {
      totalClassrooms: classrooms.length,
      totalReservations: analytics.reduce((sum, item) => sum + item.reservations.totalReservations, 0),
      totalHoursReserved: analytics.reduce((sum, item) => sum + item.reservations.totalHoursReserved, 0),
      averageUtilizationRate: analytics.reduce((sum, item) => sum + item.occupancy.utilizationRate, 0) / classrooms.length,
      mostUsedClassroom: analytics.sort((a, b) => 
        b.reservations.totalHoursReserved - a.reservations.totalHoursReserved
      )[0]?.classroomFullName || 'N/A',
      leastUsedClassroom: analytics.sort((a, b) => 
        a.reservations.totalHoursReserved - b.reservations.totalHoursReserved
      )[0]?.classroomFullName || 'N/A'
    };

    // Step 7: Return the combined analytics
    return {
      period: {
        startDate,
        endDate,
        daysAnalyzed: Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000))
      },
      overallStats,
      classroomAnalytics: analytics
    };
  }
}

export default GetClassroomAnalyticsUseCase;