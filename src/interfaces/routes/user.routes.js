import express from 'express';
import { registerUser } from '../controllers/UserController.js';

const router = express.Router();

// Ruta POST para registrar usuario
router.post('/registro', registerUser);

export default router;
