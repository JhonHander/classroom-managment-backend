// This use case handles the login process for a user.

export class LoginUserUseCase {
  constructor(userRepository, hashingService, jwtService) {
    this.userRepository = userRepository;
    this.hashingService = hashingService;
    this.jwtService = jwtService;
  }

  async execute({ email, password }) {
    // Step 1: Basic validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

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

    // Step 4: Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role?.name || 'user' // Assuming role is an object with a name property
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