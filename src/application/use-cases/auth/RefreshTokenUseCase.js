/**
 * RefreshTokenUseCase.js
 * Use case for refreshing an expired JWT token using a valid refresh token.
 */

class RefreshTokenUseCase {
  constructor(jwtService, userRepository) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }

  /**
   * Execute the use case to refresh an access token
   * @param {string} refreshToken - The refresh token to validate
   * @returns {Promise<Object>} - Result with new tokens or error
   */
  async execute(refreshToken) {
    if (!refreshToken) {
      return {
        success: false,
        message: 'Refresh token is required'
      };
    }    
    try {
      // Verify if the refresh token is valid
      let decoded;
      try {
        decoded = await this.jwtService.verifyRefreshToken(refreshToken);
      } catch (error) {
        return {
          success: false,
          message: error.message || 'Invalid refresh token'
        };
      }
      
      if (!decoded) {
        return {
          success: false,
          message: 'Invalid refresh token'
        };
      }

      // Get the user from the database to ensure they still exist and have the right permissions
      const user = await this.userRepository.findById(decoded.id);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Generate a new access token
      const payload = {
        id: user.id,
        email: user.email,
        role: {
          id: user.role.id,
          name: user.role.name
        }
      };
      
      const accessToken = await this.jwtService.generateToken(payload);
      
      // Optionally, we could also generate a new refresh token if needed
      const newRefreshToken = await this.jwtService.generateRefreshToken(payload);

      return {
        success: true,
        data: {
          accessToken: accessToken,
          refreshToken: newRefreshToken,
          user: user
          // user: {
          //   id: user.id,
          //   email: user.email,
          //   name: user.name,
          //   role: user.role.name
          // }
        }
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return {
        success: false,
        message: 'Failed to refresh token'
      };
    }
  }
}

export default RefreshTokenUseCase;
