import User from '../../../domain/entities/User.js';

export class RegisterUserUseCase {
  constructor(userRepository, hashingService) {
    this.userRepository = userRepository;
    this.hashingService = hashingService;
    // this.emailNotificationService = emailNotificationService;
  }

  async execute({ name, lastName, email, password, role }) {
    // Step 1: Validate input
    if (!email || !password || !name) {
      throw new Error('Email, password and name are required');
    }

    // Step 2: Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Step 3: Hash password
    const hashedPassword = await this.hashingService.hashPassword(password);

    // Step 4: Create domain entity
    const newUser = new User({
      name,
      lastName,
      email,
      password: hashedPassword,
      role
    });

    // Step 5: Save user to database
    const savedUser = await this.userRepository.create(newUser);

    // Step 6: Send welcome email (non-blocking)
    try {
      await this.emailNotificationService.sendRegistrationThankYouEmail(email, name);
    } catch (error) {
      // Log the error but don't fail the registration
      console.error('Failed to send welcome email:', error);
    }

    // Step 7: Return created user (without password)
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }
}
