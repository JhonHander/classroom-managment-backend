/**
 * iotMiddleware.js
 * Middlewares específicos para el módulo IoT
 */
import { authenticate } from './authMiddleware.js';

/**
 * Middleware para autorización flexible
 * Permite autenticación tanto por API key (sensores IoT) como por JWT (usuarios normales)
 */
export const flexAuth = (req, res, next) => {
  // Si la petición tiene un API key válido para sensores, permitirla
  const apiKey = req.headers['x-iot-api-key'];
  if (apiKey === process.env.IOT_API_KEY) {
    return next();
  }
  
  // De lo contrario, usar autenticación normal (JWT)
  return authenticate()(req, res, next);
};

/**
 * Middleware específico para sensores IoT
 * Solo permite acceso a dispositivos con una API key válida
 */
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
