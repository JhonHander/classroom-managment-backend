import { Router } from 'express';
import container from '../../config/container.js';

const router = Router();

const classroomController = container.resolve('classroomController');

/**
 * @route POST /api/users/register
 * @desc Register a new user
 * @access Public
 */

router.get('/findClassrooms', (req, res) => classroomController.getAvailableClassrooms(req, res));
export default router;