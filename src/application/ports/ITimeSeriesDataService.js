/**
 * Interface for the InfluxDB time series data service
 */
class ITimeSeriesDataService {
    /**
     * Saves sensor reading to the time-series database
     * @param {Object} reading - The sensor reading object
     * @param {string} reading.sensorCode - The sensor code
     * @param {string} reading.classroomId - The classroom ID
     * @param {number} reading.value - The sensor reading value
     * @param {string} reading.type - Type of reading (e.g., "occupancy", "temperature")
     * @param {Date} reading.timestamp - Timestamp of the reading
     * @returns {Promise<boolean>} - Success result
     */
    async saveSensorReading(reading) {
        throw new Error('Method not implemented');
    }

    /**
     * Retrieves sensor readings for a specific classroom
     * @param {Object} params - Query parameters
     * @param {string} params.classroomId - The classroom ID
     * @param {string} [params.sensorCode] - Optional sensor code
     * @param {string} [params.type] - Optional type of reading
     * @param {Date} params.from - Start timestamp
     * @param {Date} params.to - End timestamp
     * @param {string} [params.aggregation] - Aggregation function: 'mean', 'max', etc.
     * @param {string} [params.interval] - Time interval for aggregation
     * @returns {Promise<Array>} - Array of readings
     */
    async getClassroomReadings(params) {
        throw new Error('Method not implemented');
    }

    /**
     * Retrieves the latest reading for a classroom
     * @param {string} classroomId - The classroom ID
     * @param {string} [type] - Optional type of reading
     * @returns {Promise<Object|null>} - Latest reading or null if none found
     */
    async getLatestClassroomReading(classroomId, type) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets occupancy statistics for a classroom over a period
     * @param {string} classroomId - The classroom ID
     * @param {Date} from - Start timestamp
     * @param {Date} to - End timestamp
     * @returns {Promise<Object>} - Statistics object
     */
    async getOccupancyStats(classroomId, from, to) {
        throw new Error('Method not implemented');
    }
}

export default ITimeSeriesDataService;