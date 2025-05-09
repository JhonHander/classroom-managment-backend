import express from 'express';
import container from '../../config/container.js';
import ReservationController from '../controllers/ReservationController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initialize controller
const reservationController = container.resolve('reservationController');

/**
 * @route GET /api/reservations
 * @desc Get all reservations (with optional filters)
 * @access Private
 * @query {string} [userId] - Filter by user ID
 * @query {string} [classroomFullName] - Filter by classroom full name
 * @query {string} [date] - Filter by date (YYYY-MM-DD)
 * @query {string} [status] - Filter by reservation status
 * @returns {Array} JSON array of reservations
 */
router.get('/', authenticate(), (req, res) => reservationController.getAllReservations(req, res));

/**
 * @route GET /api/reservations/:id
 * @desc Get a specific reservation by ID
 * @access Private
 * @param {string} id - Reservation ID
 * @returns {Object} JSON object with reservation details
 */
router.get('/:id', authenticate(), (req, res) => reservationController.getReservationById(req, res));

/**
 * @route GET /api/reservations/user/:userId
 * @desc Get all reservations for a specific user
 * @access Private
 * @param {string} userId - User ID
 * @returns {Array} JSON array of user's reservations
 */
router.get('/user/', authenticate(), (req, res) => reservationController.getReservationsByUserId(req, res));

/**
 * @route GET /api/reservations/classroom/:classroomFullName
 * @desc Get all reservations for a specific classroom
 * @access Private
 * @param {string} classroomFullName - Classroom full name (e.g., "10-101")
 * @returns {Array} JSON array of classroom's reservations
 */
router.get('/classroom/:classroomFullName', authenticate(), (req, res) => reservationController.getReservationsByClassroom(req, res));

/**
 * @route POST /api/reservations
 * @desc Create a new reservation
 * @access Private
 * @body {number} userId - ID of the user making the reservation
 * @body {string} classroomFullName - Full name of the classroom (e.g., "10-101")
 * @body {string} date - Date of reservation in YYYY-MM-DD format
 * @body {string} startHour - Start time in HH:MM format
 * @body {string} finishHour - End time in HH:MM format
 * @returns {Object} JSON response with created reservation
 */
router.post('/', authenticate(), (req, res) => reservationController.createReservation(req, res));

/**
 * @route PUT /api/reservations/:id
 * @desc Update a reservation's status or details
 * @access Private
 * @param {string} id - Reservation ID
 * @body {string} [reservationStatusId] - New status ID for the reservation
 * @body {string} [startHour] - Updated start time
 * @body {string} [finishHour] - Updated end time
 * @returns {Object} JSON response with updated reservation
 */
router.put('/:id', authenticate(), (req, res) => reservationController.updateReservation(req, res));

/**
 * @route DELETE /api/reservations/:id
 * @desc Cancel/delete a reservation
 * @access Private
 * @param {string} id - Reservation ID
 * @returns {Object} JSON response with success status
 */
router.delete('/:id', authenticate(), (req, res) => reservationController.cancelReservation(req, res));

/**
 * @route GET /api/reservations/active/user/:email
 * @desc Check if a user has any active reservations
 * @access Private
 * @param {string} email - User email
 * @returns {Object} JSON response with active reservation or empty if none
 */
router.get('/active/user/:email', authenticate(), (req, res) => reservationController.getActiveReservationByUser(req, res));

/**
 * @route GET /api/reservations/date/:date
 * @desc Get all reservations for a specific date
 * @access Private
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} JSON array of reservations on the given date
 */
router.get('/date/:date', authenticate(), (req, res) => reservationController.getReservationsByDate(req, res));

export default router;