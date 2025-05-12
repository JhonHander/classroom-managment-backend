import { Router } from 'express';
import container from '../../config/container.js';

const router = Router();

// Obtener el controlador del contenedor
const userController = container.resolve('userController');

/**
 * @route POST /api/users/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', (req, res) => userController.register(req, res));

/**
 * @route POST /api/users/login
 * @desc Login user and get token
 * @access Public
 */
router.post('/login', (req, res) => userController.login(req, res));

/**
 * @route POST /api/users/refresh-token
 * @desc Refresh an expired access token
 * @access Public
 */
router.post('/refresh-token', (req, res) => userController.refreshToken(req, res));

// Additional routes can be added here later
// router.get('/profile', authMiddleware, (req, res) => userController.getProfile(req, res));
// router.put('/profile', authMiddleware, (req, res) => userController.updateProfile(req, res));
// router.get('/:id', authMiddleware, adminMiddleware, (req, res) => userController.getUserById(req, res));

export default router;
