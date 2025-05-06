class RegisterUserUseCase {
  constructor(userRepository, hashingService, userEntityFactory, roleEntityFactory, emailNotificationService) {
    this.userRepository = userRepository;
    this.hashingService = hashingService;
    this.userEntityFactory = userEntityFactory; 
    this.roleEntityFactory = roleEntityFactory;
    this.emailNotificationService = emailNotificationService;
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

    // Step 4: Create role object using the factory
    const roleId = role || 3;
    const roleName = roleId === 1 ? 'admin' : (roleId === 2 ? 'teacher' : 'student');
    const roleObject = this.roleEntityFactory({ id: roleId, name: roleName });

    // Step 5: Create user entity using the factory
    const newUser = this.userEntityFactory({
      name,
      lastName,
      email,
      password: hashedPassword,
      role: roleObject
    });

    // Step 6: Save user to database
    const savedUser = await this.userRepository.create(newUser);

    // Step 7: Send welcome email (non-blocking)
    try {
      await this.emailNotificationService.sendRegistrationThankYouEmail(email, name);
      console.log('Welcome email sent successfully to', email);
    } catch (error) {
      // Log the error but don't fail the registration
      console.error('Failed to send welcome email:', error);
    }

    // Step 8: Return created user (without password)
    const userWithoutPassword = {
      id: savedUser.id,
      name: savedUser.name,
      lastName: savedUser.lastName,
      email: savedUser.email,
      role: savedUser.role
    };
    
    return userWithoutPassword;
  }
}

export default RegisterUserUseCase;
