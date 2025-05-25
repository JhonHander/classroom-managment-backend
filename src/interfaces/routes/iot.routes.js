/**
 * iot.routes.js
 * Rutas para la API de IoT
 */
import { Router } from 'express';
import container from '../../config/container.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();
const iotController = container.resolve('iotController');
const verifyToken = container.resolve('verifyTokenUseCase');

// Middleware para autorización flexible
// Para endpoints que pueden ser usados tanto por sensores IoT como por usuarios autenticados
const flexAuth = (req, res, next) => {
  // Si la petición tiene un API key válido para sensores, permitirla
  const apiKey = req.headers['x-iot-api-key'];
  if (apiKey === process.env.IOT_API_KEY) {
    return next();
  }
  
  // De lo contrario, usar autenticación normal (JWT)
  return authenticate()(req, res, next);
};

// Middleware específico para sensores IoT
const sensorAuth = (req, res, next) => {
  const apiKey = req.headers['x-iot-api-key'];
  if (apiKey !== process.env.IOT_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid API key'
    });
  }
  next();
};

// Rutas públicas - disponibles para todos
// Endpoint para obtener la ocupación actual de todas las aulas
router.get('/occupancy', iotController.getRealTimeOccupancy.bind(iotController));

// Endpoint para obtener la ocupación actual de un aula específica
router.get('/occupancy/:classroomId', iotController.getClassroomOccupancy.bind(iotController));

// Rutas que requieren autenticación flexible (API key o JWT)
// Endpoint para obtener el historial de ocupación de un aula
router.get('/occupancy/:classroomId/history', flexAuth, iotController.getOccupancyHistory.bind(iotController));

// Rutas que requieren API key de sensor - usadas por sensores ESP32
// Endpoint para recibir datos de un sensor
router.post('/sensors/data', sensorAuth, iotController.receiveSensorData.bind(iotController));

// Endpoint para recibir datos de múltiples sensores
router.post('/sensors/bulk-data', sensorAuth, iotController.receiveBulkSensorData.bind(iotController));

export default router;
