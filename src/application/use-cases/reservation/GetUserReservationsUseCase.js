class GetUserReservationsUseCase {
  constructor(reservationRepository, userRepository) {
    this.reservationRepository = reservationRepository;
    this.userRepository = userRepository;
  }

  async execute({ userId, status, fromDate, toDate }) {
    // Step 1: Validate user
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Step 2: Prepare date filters
    let dateFilter = {};
    if (fromDate) {
      dateFilter.from = new Date(fromDate);
    }
    if (toDate) {
      dateFilter.to = new Date(toDate);
    }

    // Step 3: Get reservations for user with optional filters
    const reservations = await this.reservationRepository.findByUser(userId, { status, dateFilter });

    return reservations;
  }
}

export default GetUserReservationsUseCase;