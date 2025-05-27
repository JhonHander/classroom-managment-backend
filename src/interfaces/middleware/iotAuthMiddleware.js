/**
 * iotAuthMiddleware.js
 * Middlewares de autenticación para rutas de IoT
 */
import dotenv from 'dotenv';
import { authenticate } from './authMiddleware.js'; 

dotenv.config(); 

// Middleware específico para sensores IoT
export const sensorAuth = (req, res, next) => {
  const apiKey = req.headers['x-iot-api-key'];
  if (apiKey !== process.env.IOT_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid API key'
    });
  }
  next();
};

// Middleware para autorización flexible
// Para endpoints que pueden ser usados tanto por sensores IoT como por usuarios autenticados
export const flexAuth = (req, res, next) => {
  // Si la petición tiene un API key válido para sensores, permitirla
  const apiKey = req.headers['x-iot-api-key'];
  if (apiKey === process.env.IOT_API_KEY) {
    return next();
  }
  
  return authenticate()(req, res, next);
}; 