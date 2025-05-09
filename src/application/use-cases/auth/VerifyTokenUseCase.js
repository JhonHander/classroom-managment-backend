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

    // Step 3: Extract user email from payload (usando email como identificador principal)
    const { email, userId } = payload;
    if (!email) {
      throw new Error('Invalid token payload: email missing');
    }

    // Step 4: Verify that the user still exists in the database
    let user;
    
    // Priorizar búsqueda por email
    if (email) {
      user = await this.userRepository.findByEmail(email);
    } 
    // Fallback: si no hay email pero hay userId, buscar por ID (para compatibilidad)
    else if (userId) {
      user = await this.userRepository.findById(userId);
    }
    
    if (!user) {
      throw new Error('User not found');
    }

    // Step 5: Return the decoded payload and user info
    return {
      success: true,
      payload,
      user
    };
  }
}

export default VerifyTokenUseCase;