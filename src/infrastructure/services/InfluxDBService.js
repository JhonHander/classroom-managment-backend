import ITimeSeriesDataService from '../../application/ports/ITimeSeriesDataService';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

class InfluxDBService extends ITimeSeriesDataService {
    constructor(config) {
        super();
        this.influx = new InfluxDB({
            url: config.url,
            token: config.token
        });
        this.org = config.org;
        this.bucket = config.bucket;
        this.writeClient = this.influx.getWriteApi(this.org, this.bucket, 'ns');
        this.queryClient = this.influx.getQueryApi(this.org);
    }

    async saveSensorReading(reading) {
        try {
            const point = new Point('sensor_reading')
                .tag('sensorCode', reading.sensorCode)
                .tag('classroomId', reading.classroomId)
                .tag('type', reading.type)
                .floatField('value', reading.value)
                .timestamp(reading.timestamp || new Date());

            this.writeClient.writePoint(point);
            await this.writeClient.flush();
            
            return true;
        } catch (error) {
            console.error('Error saving sensor reading to InfluxDB:', error);
            throw error;
        }
    }

    async getClassroomReadings({ classroomId, sensorCode, type, from, to, aggregation = 'mean', interval = '5m' }) {
        try {
            let query = `
                from(bucket: "${this.bucket}")
                |> range(start: ${from.toISOString()}, stop: ${to.toISOString()})
                |> filter(fn: (r) => r._measurement == "sensor_reading")
                |> filter(fn: (r) => r.classroomId == "${classroomId}")
            `;

            if (sensorCode) {
                query += `|> filter(fn: (r) => r.sensorCode == "${sensorCode}")`;
            }

            if (type) {
                query += `|> filter(fn: (r) => r.type == "${type}")`;
            }

            query += `
                |> aggregateWindow(every: ${interval}, fn: ${aggregation}, createEmpty: false)
                |> yield(name: "result")
            `;

            const result = await this.queryClient.collectRows(query);
            return result.map(row => ({
                time: new Date(row._time),
                value: row._value,
                sensorCode: row.sensorCode,
                type: row.type,
                classroomId: row.classroomId
            }));
        } catch (error) {
            console.error('Error querying InfluxDB:', error);
            throw error;
        }
    }

    async getLatestClassroomReading(classroomId, type = 'occupancy') {
        try {
            const query = `
                from(bucket: "${this.bucket}")
                |> range(start: -1h)
                |> filter(fn: (r) => r._measurement == "sensor_reading")
                |> filter(fn: (r) => r.classroomId == "${classroomId}")
                |> filter(fn: (r) => r.type == "${type}")
                |> last()
            `;

            const result = await this.queryClient.collectRows(query);
            
            if (result.length === 0) {
                return null;
            }

            const row = result[0];
            return {
                time: new Date(row._time),
                value: row._value,
                sensorCode: row.sensorCode,
                type: row.type,
                classroomId: row.classroomId
            };
        } catch (error) {
            console.error('Error getting latest reading from InfluxDB:', error);
            throw error;
        }
    }

    async getOccupancyStats(classroomId, from, to) {
        try {
            // Average occupancy
            const avgQuery = `
                from(bucket: "${this.bucket}")
                |> range(start: ${from.toISOString()}, stop: ${to.toISOString()})
                |> filter(fn: (r) => r._measurement == "sensor_reading")
                |> filter(fn: (r) => r.classroomId == "${classroomId}")
                |> filter(fn: (r) => r.type == "occupancy")
                |> mean()
            `;

            // Max occupancy
            const maxQuery = `
                from(bucket: "${this.bucket}")
                |> range(start: ${from.toISOString()}, stop: ${to.toISOString()})
                |> filter(fn: (r) => r._measurement == "sensor_reading")
                |> filter(fn: (r) => r.classroomId == "${classroomId}")
                |> filter(fn: (r) => r.type == "occupancy")
                |> max()
            `;

            const [avgResult, maxResult] = await Promise.all([
                this.queryClient.collectRows(avgQuery),
                this.queryClient.collectRows(maxQuery)
            ]);

            const averageOccupancy = avgResult.length > 0 ? avgResult[0]._value : 0;
            const maxOccupancy = maxResult.length > 0 ? maxResult[0]._value : 0;

            return {
                averageOccupancy,
                maxOccupancy,
                period: {
                    from,
                    to
                }
            };
        } catch (error) {
            console.error('Error getting occupancy stats from InfluxDB:', error);
            throw error;
        }
    }
}

export default InfluxDBService;