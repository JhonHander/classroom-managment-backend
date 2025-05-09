// This use case handles the login process for a user.

class LoginUserUseCase {
  constructor(userRepository, hashingService, jwtService) {
    this.userRepository = userRepository;
    this.hashingService = hashingService;
    this.jwtService = jwtService;
  }

  async execute({ email, password }) {

    // Step 2: Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Step 3: Verify password
    const isPasswordValid = await this.hashingService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Step 4: Generate JWT token with email as primary identifier
    const tokenPayload = {
      email: user.email,       // Email como identificador principal
      userId: user.id,         // Mantener userId por compatibilidad
      role: user.role?.name || 'user'
    };
    
    const token = await this.jwtService.generateToken(tokenPayload);

    // Step 5: Return user data and token
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }
}

export default LoginUserUseCase;