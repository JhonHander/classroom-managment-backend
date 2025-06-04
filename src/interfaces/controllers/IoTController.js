/**
 * IoTController.js
 * Controlador para manejar peticiones de sensores IoT
 */
class IoTController {
  /**
   * @param {Object} processIoTSensorDataUseCase - Caso de uso para procesar datos de sensores
   * @param {Object} getRealTimeClassroomOccupancyUseCase - Caso de uso para obtener ocupación en tiempo real
   */
  constructor(
    processIoTSensorDataUseCase,
    getRealTimeClassroomOccupancyUseCase
  ) {
    this.processIoTSensorDataUseCase = processIoTSensorDataUseCase;
    this.getRealTimeClassroomOccupancyUseCase = getRealTimeClassroomOccupancyUseCase;
  }

  /**
   * Recibe datos de sensores IoT
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async receiveSensorData(req, res) {
    try {
      const sensorData = req.body;
      
      // Procesar los datos del sensor
      const result = await this.processIoTSensorDataUseCase.execute(sensorData);
      
      res.status(200).json({
        success: true,
        message: 'Datos del sensor procesados correctamente',
        data: result
      });
    } catch (error) {
      console.error('Error processing sensor data:', error);
      
      if (error.message.includes('required')) {
        return res.status(400).json({ 
          success: false,
          error: error.message 
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Error processing sensor data' 
      });
    }
  }
  /**
   * Recibe datos de múltiples sensores IoT en un solo request
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async receiveBulkSensorData(req, res) {
    try {
      const sensorDataArray = req.body;
      
      if (!Array.isArray(sensorDataArray)) {
        return res.status(400).json({ 
          success: false,
          error: 'Payload must be an array of sensor readings' 
        });
      }
      
      // Procesar cada conjunto de datos
      const results = await Promise.all(
        sensorDataArray.map(data => this.processIoTSensorDataUseCase.execute(data).catch(err => ({
          error: err.message,
          sensorCode: data.sensorCode
        })))
      );
      
      res.status(200).json({
        success: true,
        processed: results.length,
        results
      });
    } catch (error) {
      console.error('Error processing bulk sensor data:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error processing bulk sensor data' 
      });
    }
  }

  /**
   * Obtiene la ocupación en tiempo real de todas las aulas
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getRealTimeOccupancy(req, res) {
    try {
      // Extraer filtros de query params
      const filters = {};
        if (req.query.status) {
        filters.status = req.query.status;
      }
      
      // Obtener datos de ocupación en tiempo real
      const occupancyData = await this.getRealTimeClassroomOccupancyUseCase.execute(filters);
      
      res.status(200).json({
        success: true,
        timestamp: new Date(),
        classrooms: occupancyData
      });
    } catch (error) {
      console.error('Error getting real-time occupancy:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error getting real-time occupancy data' 
      });
    }
  }

  /**
   * Obtiene la ocupación en tiempo real de un aula específica
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getClassroomOccupancy(req, res) {
    try {
      const { classroomId } = req.params;
      
      if (!classroomId) {
        return res.status(400).json({ 
          success: false,
          error: 'Classroom ID is required' 
        });
      }
      
      // Obtener datos de ocupación del aula
      const occupancyData = await this.getRealTimeClassroomOccupancyUseCase.getForClassroom(classroomId);
      
      res.status(200).json({
        success: true,
        timestamp: new Date(),
        classroom: occupancyData
      });
    } catch (error) {
      console.error(`Error getting occupancy for classroom ${req.params.classroomId}:`, error);
      res.status(500).json({ 
        success: false,
        error: 'Error getting classroom occupancy data' 
      });
    }
  }
  /**
   * Obtiene el historial de ocupación de un aula
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getOccupancyHistory(req, res) {
    try {
      const { classroomId } = req.params;
      const { 
        from = new Date(Date.now() - 24 * 60 * 60 * 1000), // Default: últimas 24h
        to = new Date(),
        interval = '5m'
      } = req.query;
      
      if (!classroomId) {
        return res.status(400).json({ 
          success: false,
          error: 'Classroom ID is required' 
        });
      }
      
      // Obtener historial de ocupación
      const historyData = await this.getRealTimeClassroomOccupancyUseCase.getHistory(
        classroomId,
        new Date(from),
        new Date(to),
        interval
      );
      
      res.status(200).json({
        success: true,
        classroomId,
        timeRange: {
          from: new Date(from),
          to: new Date(to),
          interval
        },
        data: historyData
      });
    } catch (error) {
      console.error(`Error getting occupancy history for classroom ${req.params.classroomId}:`, error);
      res.status(500).json({ 
        success: false,
        error: 'Error getting occupancy history data' 
      });    }
  }
}

export default IoTController;