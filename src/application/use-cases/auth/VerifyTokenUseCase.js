class VerifyTokenUseCase {
  constructor(jwtService, userRepository) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }
  async execute(token) {
    // Step 1: Validate input
    if (!token) {
      return {
        success: false,
        message: 'Token is required'
      };
    }    try {
      // Step 2: Verify token and extract payload
      let payload;
      try {
        payload = await this.jwtService.verifyToken(token);
      } catch (error) {
        return {
          success: false,
          message: error.message || 'Invalid token'
        };
      }

      if (!payload) {
        return {
          success: false,
          message: 'Invalid token'
        };
      }

      // Step 3: Extract user ID and email from payload
      const { id, email, role } = payload;
      
      if (!id && !email) {
        return {
          success: false,
          message: 'Invalid token payload: missing user identifier'
        };
      }
      
      // Verificar que el payload tenga información sobre el rol
      if (!role || !role.name) {
        return {
          success: false,
          message: 'Invalid token payload: missing role information'
        };
      }

      // Step 4: Verify that the user still exists in the database
      let user;
      
      // Priorizar búsqueda por email si está disponible
      if (email) {
        user = await this.userRepository.findByEmail(email);
      } 
      // Si no hay email o no se encontró por email, buscar por ID
      if (!user && id) {
        user = await this.userRepository.findById(id);
      }
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }      
      // Step 5: Verificar que el rol del usuario en la base de datos coincide con el del token
      // Esto evita que un usuario pueda modificar su rol en el token
      if (user.role.name !== role.name) {
        console.warn(`Posible manipulación de token: El rol en el token (${role.name}) difiere del rol en la base de datos (${user.role.name}) para el usuario ${user.email}`);
        return {
          success: false,
          message: 'Token role mismatch'
        };
      }

      // Step 6: Return the user info
      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return {
        success: false,
        message: 'Error verifying token: ' + error.message
      };
    }
  }
}

export default VerifyTokenUseCase;