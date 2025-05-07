class GetDashboardSummaryUseCase {
  constructor(classroomRepository, reservationRepository, userRepository, sensorRepository) {
    this.classroomRepository = classroomRepository;
    this.reservationRepository = reservationRepository;
    this.userRepository = userRepository;
    this.sensorRepository = sensorRepository;
  }

  async execute() {
    // Get current date for today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Step 1: Get overall system statistics
    const [
      totalClassrooms,
      totalUsers,
      pendingReservations,
      todayReservations,
      activeClassrooms
    ] = await Promise.all([
      this.classroomRepository.countAll(),
      this.userRepository.countAll(),
      this.reservationRepository.countByStatus(1), // Pending status
      this.reservationRepository.countByDateRange(today, tomorrow), // Today's reservations
      this.sensorRepository ? this.sensorRepository.countActiveClassrooms() : 0
    ]);

    // Step 2: Get classroom type distribution
    const classroomsByType = await this.classroomRepository.getTypeDistribution();

    // Step 3: Get user role distribution
    const usersByRole = await this.userRepository.getRoleDistribution();

    // Step 4: Get recent activity
    const recentReservations = await this.reservationRepository.getRecent(5);
    
    // Step 5: Get real-time occupancy stats if sensor repository is available
    let occupancyStats = null;
    if (this.sensorRepository) {
      occupancyStats = await this.sensorRepository.getCurrentOccupancySummary();
    }

    // Step 6: Return the dashboard summary
    return {
      overview: {
        totalClassrooms,
        totalUsers,
        pendingReservations,
        todayReservations,
        activeClassrooms,
        occupiedClassroomsPercentage: 
          totalClassrooms > 0 && occupancyStats 
            ? (occupancyStats.occupiedClassrooms / totalClassrooms) * 100 
            : 0
      },
      distribution: {
        classroomsByType,
        usersByRole
      },
      recentActivity: recentReservations,
      occupancy: occupancyStats
    };
  }
}

export default GetDashboardSummaryUseCase;