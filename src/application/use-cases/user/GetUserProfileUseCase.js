class GetUserProfileUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    // Step 1: Validate input
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Step 2: Retrieve user information
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Step 3: Return user profile without sensitive information
    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      fullName: user.full_name,
      email: user.email,
      role: user.role
      // Removed password and other sensitive information
    };
  }
}

export default GetUserProfileUseCase;