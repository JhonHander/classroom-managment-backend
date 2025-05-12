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

    // Step 4: Generate JWT token with email and user data
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name
      }
    };
    
    // Generate access token
    const accessToken = await this.jwtService.generateToken(tokenPayload);
    
    // Generate refresh token
    const refreshToken = await this.jwtService.generateRefreshToken(tokenPayload);

    // Step 5: Return user data and tokens
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }
}

export default LoginUserUseCase;