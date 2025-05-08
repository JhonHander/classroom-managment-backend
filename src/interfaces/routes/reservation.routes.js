import express from 'express';
import container from '../../config/container.js';
import ReservationController from '../controllers/ReservationController.js';

const router = express.Router();

// Initialize controller
const reservationController = container.resolve('reservationController');

/**
 * @route POST /api/reservations
 * @desc Create a new reservation
 * @access Private
 * @body {number} userId - ID of the user making the reservation
 * @body {number} classroomId - ID of the classroom to reserve
 * @body {string} date - Date of reservation in YYYY-MM-DD format
 * @body {string} startHour - Start time in HH:MM format
 * @body {string} finishHour - End time in HH:MM format
 * @body {string} [purpose] - Optional purpose of the reservation
 * @returns {Object} JSON response with created reservation
 */
router.post('/', (req, res) => reservationController.createReservation(req, res));

export default router;