class VerifyTokenUseCase {
  constructor(jwtService, userRepository) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }

  async execute(token) {
    // Step 1: Validate input
    if (!token) {
      throw new Error('Token is required');
    }

    // Step 2: Verify token and extract payload
    const payload = await this.jwtService.verifyToken(token);
    if (!payload) {
      throw new Error('Invalid token');
    }

    // Step 3: Extract user ID from payload
    const { userId } = payload;
    if (!userId) {
      throw new Error('Invalid token payload');
    }

    // Step 4: Verify that the user still exists in the database (optional)
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Step 5: Return the decoded payload and user info
    return {
      payload,
      user
    };
  }
}

export default VerifyTokenUseCase;