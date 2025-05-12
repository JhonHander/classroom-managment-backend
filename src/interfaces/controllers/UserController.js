import { RegisterUserDTO } from '../dtos/RegisterUserDTO.js';
import { LoginUserDTO } from '../dtos/LoginUserDTO.js';

class UserController {
  constructor(registerUserUseCase, loginUserUseCase, refreshTokenUseCase) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
    this.refreshTokenUseCase = refreshTokenUseCase;
  }

  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  
  async register(req, res) {
 

    try {
      // Create and validate DTO from request body
      const registerUserDTO = new RegisterUserDTO(req.body);
      const { isValid, errors } = registerUserDTO.validate();
      console.log('Body recibido:', req.body);
      console.log('DTO transformado:', registerUserDTO.toData());
      if (!isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          errors 
        });
      }

      // Execute use case with validated data
      const userData = registerUserDTO.toData();
      const registeredUser = await this.registerUserUseCase.execute(userData);

      // Return success response
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: registeredUser
      });
    } catch (error) {
      console.error('Error registering user:', error);
      
      // Handle known errors
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Generic error response
      return res.status(500).json({
        success: false,
        message: 'Failed to register user',
        error: error.message
      });
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const loginUserDTO = new LoginUserDTO(req.body);
      const { isValid, errors } = loginUserDTO.validate();

      if(!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      const loginUserData = loginUserDTO.toData();
      const result = await this.loginUserUseCase.execute(loginUserData);      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error) {
      console.error('Error logging in:', error);

      if (error.message === 'Invalid credentials') {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to log in',
        error: error.message
      });
    }
  }

  /**
   * Refresh an expired access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const result = await this.refreshTokenUseCase.execute(refreshToken);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: result.message || 'Invalid refresh token'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.data.accessToken,
          user: result.data.user
        }
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to refresh token'
      });
    }
  }
}

export default UserController;
