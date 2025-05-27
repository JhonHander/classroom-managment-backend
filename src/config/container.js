import { sequelize, models } from './database.js';

// --- Importación de entidades del dominio ---
import User from '../domain/entities/User.js';
import Role from '../domain/entities/Role.js';

// --- Importación de las implementaciones de Repositorio ---
import { SequelizeClassroomRepository } from '../infrastructure/repositories/SequelizeClassroomRepository.js';
import { SequelizeReservationRepository } from '../infrastructure/repositories/SequelizeReservationRepository.js';
import { SequelizeScheduleRepository } from '../infrastructure/repositories/SequelizeScheduleRepository.js';
import { SequelizeUserRepository } from '../infrastructure/repositories/SequelizeUserRepository.js';
import { SequelizeSensorRepository } from '../infrastructure/repositories/SequelizeSensorRepository.js';

// --- Importación de Servicios ---
import JsonWebTokenService from '../infrastructure/services/JsonWebTokenService.js';
import HashingService from '../infrastructure/services/HashingService.js';
import EmailNotificationService from '../infrastructure/services/EmailNotificationService.js';
import SocketIOService from '../infrastructure/services/SocketIOService.js';
import InfluxDBService from '../infrastructure/services/InfluxDBService.js';

// --- Importacion de casos de uso ---
import RegisterUserUseCase from '../application/use-cases/auth/RegisterUserUseCase.js';
import LoginUserUseCase from '../application/use-cases/auth/LoginUserUseCase.js';
import VerifyTokenUseCase from '../application/use-cases/auth/VerifyTokenUseCase.js';
import RefreshTokenUseCase from '../application/use-cases/auth/RefreshTokenUseCase.js';
import FindAvailableClassroomsUseCase from '../application/use-cases/classroom/FindAvailableClassroomsUseCase.js';
import CreateReservationUseCase from '../application/use-cases/reservation/CreateReservationUseCase.js';
import GetAllReservationsUseCase from '../application/use-cases/reservation/admin/GetAllReservationsUseCase.js';
import GetReservationByIdUseCase from '../application/use-cases/reservation/GetReservationByIdUseCase.js';
import UpdateReservationUseCase from '../application/use-cases/reservation/admin/UpdateReservationUseCase.js';
import CancelReservationUseCase from '../application/use-cases/reservation/CancelReservationUseCase.js';
import GetActiveReservationUserUseCase from '../application/use-cases/reservation/GetActiveReservationUserUseCase.js';
import GetReservationsByUserUseCase from '../application/use-cases/reservation/GetReservationsByUserUseCase.js';
import GetReservationsByClassroomUseCase from '../application/use-cases/reservation/GetReservationsByClassroomUseCase.js';
import GetReservationsByDateUseCase from '../application/use-cases/reservation/GetReservationsByDateUseCase.js';
import UpdateAvailableClassroomsRealTimeUseCase from '../application/use-cases/classroom/UpdateAvailableClassroomsRealTimeUseCase.js';
import ProcessIoTSensorDataUseCase from '../application/use-cases/iot/ProcessIoTSensorDataUseCase.js';
import GetRealTimeClassroomOccupancyUseCase from '../application/use-cases/iot/GetRealTimeClassroomOccupancyUseCase.js';

// --- Importación de servicios IoT ---
import RealTimeOccupancyService from '../infrastructure/services/iot/RealTimeOccupancyService.js';

// --- Importación de controladores ---
import UserController from '../interfaces/controllers/UserController.js';
import ClassroomController from '../interfaces/controllers/ClassroomController.js';
import ReservationController from '../interfaces/controllers/ReservationController.js';
import IoTController from '../interfaces/controllers/IoTController.js';
import WebSocketController from '../interfaces/controllers/WebSocketController.js';

import dotenv from 'dotenv';

dotenv.config();

class AppContainer {
    constructor() {
        this._dependencies = {};
        this._singletons = {};
    }

    register(name, definition, options = { singleton: false }) {
        if (options.singleton) {
            this._dependencies[name] = { definition, singleton: true };
        } else {
            this._dependencies[name] = { definition, singleton: false };
        }
        console.log(`Dependency registered: ${name} (Singleton: ${options.singleton})`); // Puedes comentar esto en producción
    }

    resolve(name) {
        const registration = this._dependencies[name];
        if (!registration) throw new Error(`Dependency not found: ${name}`);
        const { definition, singleton } = registration;
        
        // Si ya existe como singleton, devolver esa instancia
        if (singleton && this._singletons[name]) {
            return this._singletons[name];
        }
        
        // Crear nueva instancia
        let instance;
        if (typeof definition === 'function') {
            try {
                // Intentar llamar como función normal primero
                instance = definition(this);
            } catch (error) {
                // Si falla y es un constructor de clase, intentar con 'new'
                if (error instanceof TypeError && 
                    error.message.includes('cannot be invoked without \'new\'')) {
                    console.log(`Usando 'new' para instanciar: ${name}`);
                    instance = new definition();
                } else {
                    // Si es otro tipo de error, relanzarlo
                    throw error;
                }
            }
        } else {
            // Si no es una función, simplemente usar el valor tal cual
            instance = definition;
        }
        
        // Guardar si es singleton
        if (singleton) {
            this._singletons[name] = instance;
        }
        
        return instance;
    }
}

const container = new AppContainer();

// --- Registro de Dependencias ---

// 1. Sequelize (Singleton)
container.register('sequelize', sequelize, { singleton: true });

// 2. Modelos de Sequelize como un objeto completo
container.register('sequelizeModels', models, { singleton: true });

// 3. Repositorios (Singletons, inyectando modelos desde el objeto models)
container.register('userRepository', (c) => {
    const models = c.resolve('sequelizeModels');
    return new SequelizeUserRepository(
        models.UserModel,
        models.RoleModel
    );
}, { singleton: true });

container.register('classroomRepository', (c) => {
    const models = c.resolve('sequelizeModels');
    return new SequelizeClassroomRepository(
        models.ClassroomModel,
        models.ClassroomTypeModel,
        models.ClassroomFeatureModel,
        models.ReservationModel
    );
}, { singleton: true });

container.register('reservationRepository', (c) => {
    const models = c.resolve('sequelizeModels');
    return new SequelizeReservationRepository(
        models.ReservationModel,
        models.UserModel,
        models.ClassroomModel,
        models.ReservationStatusModel
    );
}, { singleton: true });

container.register('scheduleRepository', (c) => {
    const models = c.resolve('sequelizeModels');
    return new SequelizeScheduleRepository(
        models.ScheduleModel,
        models.ClassroomModel
    );
}, { singleton: true });

container.register('sensorRepository', (c) => {
    const models = c.resolve('sequelizeModels');
    return new SequelizeSensorRepository(
        models.SensorModel,
        models.ClassroomModel,
        models.ClassroomTypeModel
    );
}, { singleton: true });

// 4. Factories para entidades del dominio (funciones que crean instancias de las entidades)
container.register('userEntityFactory', () => {
  return (data) => new User(data);
}, { singleton: true });

container.register('roleEntityFactory', () => {
  return (data) => new Role(data);
}, { singleton: true });

// 5. Servicios
container.register('hashingService', () => {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    return new HashingService(saltRounds);
}, { singleton: true });

container.register('jwtService', () => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;
    return new JsonWebTokenService(secret, expiresIn, refreshSecret, refreshExpiresIn);
}, { singleton: true });

container.register('emailNotificationService', () => {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const defaultFrom = process.env.EMAIL_FROM;
    const nodeEnv = process.env.NODE_ENV;
    return new EmailNotificationService(
        host,
        port,
        user,
        pass,
        defaultFrom,
        nodeEnv
    );
}, { singleton: true });

// Registrar el servicio de WebSockets (como singleton)
container.register('realTimeService', () => {
  return new SocketIOService();
}, { singleton: true });

// Registrar el servicio de InfluxDB para datos de series temporales (IoT)
container.register('timeSeriesDataService', () => {
  const config = {
    url: process.env.INFLUXDB_URL || 'http://localhost:8086',
    token: process.env.INFLUXDB_TOKEN,
    org: process.env.INFLUXDB_ORG,
    bucket: process.env.INFLUXDB_BUCKET || 'iot_sensors'
  };
  
  return new InfluxDBService(config);
}, { singleton: true });

// Registrar el servicio de IoT para sensores de ocupación
container.register('iotSensorService', (c) => {
  return new RealTimeOccupancyService(
    c.resolve('sensorRepository'),
    c.resolve('timeSeriesDataService'),
    c.resolve('realTimeService')
  );
}, { singleton: true });

// 6. Casos de Uso
container.register('registerUserUseCase', (c) => {
    return new RegisterUserUseCase(
      c.resolve('userRepository'),
      c.resolve('hashingService'),
      c.resolve('userEntityFactory'),
      c.resolve('roleEntityFactory'),
      c.resolve('emailNotificationService')
    );
});

container.register('loginUserUseCase', (c) => {
    return new LoginUserUseCase(
      c.resolve('userRepository'),
      c.resolve('hashingService'),
      c.resolve('jwtService')
    );
});

container.register('verifyTokenUseCase', (c) => {
  return new VerifyTokenUseCase(
    c.resolve('jwtService'),
    c.resolve('userRepository')
  );
});

container.register('refreshTokenUseCase', (c) => {
  return new RefreshTokenUseCase(
    c.resolve('jwtService'),
    c.resolve('userRepository')
  );
});

container.register('FindAvailableClassroomsUseCase', (c) => {
  return new FindAvailableClassroomsUseCase(
    c.resolve('classroomRepository'),
    c.resolve('scheduleRepository'),
    c.resolve('reservationRepository')
  );
});

container.register('createReservationUseCase', (c) => {
  return new CreateReservationUseCase(
    c.resolve('reservationRepository'),
    c.resolve('classroomRepository'),
    c.resolve('userRepository')
  );
});

container.register('getAllReservationsUseCase', (c) => {
  return new GetAllReservationsUseCase(
    c.resolve('reservationRepository')
  );
});

container.register('getReservationByIdUseCase', (c) => {
  return new GetReservationByIdUseCase(
    c.resolve('reservationRepository')
  );
});

container.register('updateReservationUseCase', (c) => {
  return new UpdateReservationUseCase(
    c.resolve('reservationRepository')
  );
});

container.register('cancelReservationUseCase', (c) => {
  return new CancelReservationUseCase(
    c.resolve('reservationRepository')
  );
});

container.register('getActiveReservationUseCase', (c) => {
  return new GetActiveReservationUserUseCase(
    c.resolve('reservationRepository'),
    c.resolve('userRepository')

  );
});

container.register('getReservationsByUserUseCase', (c) => {
  return new GetReservationsByUserUseCase(
    c.resolve('reservationRepository'),
    c.resolve('userRepository')
  );
});

container.register('getReservationsByClassroomUseCase', (c) => {
  return new GetReservationsByClassroomUseCase(
    c.resolve('reservationRepository')
  );
});

container.register('getReservationsByDateUseCase', (c) => {
  return new GetReservationsByDateUseCase(
    c.resolve('reservationRepository')
  );
});

// Registrar el caso de uso para aulas disponibles en tiempo real
container.register('updateAvailableClassroomsRealTimeUseCase', (c) => {
  return new UpdateAvailableClassroomsRealTimeUseCase(
    c.resolve('classroomRepository'),
    c.resolve('reservationRepository'),
    c.resolve('webSocketController')
  );
});

// Registrar casos de uso para IoT
container.register('processIoTSensorDataUseCase', (c) => {
  return new ProcessIoTSensorDataUseCase(
    c.resolve('sensorRepository'),
    c.resolve('classroomRepository'),
    c.resolve('timeSeriesDataService'),
    c.resolve('iotSensorService')
  );
});

container.register('getRealTimeClassroomOccupancyUseCase', (c) => {
  return new GetRealTimeClassroomOccupancyUseCase(
    c.resolve('iotSensorService'),
    c.resolve('classroomRepository')
  );
});

// 6. Controladores
container.register('userController', (c) => {
  return new UserController(
    c.resolve('registerUserUseCase'),
    c.resolve('loginUserUseCase'),
    c.resolve('refreshTokenUseCase')
  );
}, { singleton: true });

container.register('classroomController', (c) => {
  return new ClassroomController(
    c.resolve('FindAvailableClassroomsUseCase'),
    
  );
}, { singleton: true });

container.register('reservationController', (c) => {
  return new ReservationController(
    c.resolve('createReservationUseCase'),
    c.resolve('getAllReservationsUseCase'),
    c.resolve('getReservationByIdUseCase'),
    c.resolve('updateReservationUseCase'),
    c.resolve('cancelReservationUseCase'),
    c.resolve('getActiveReservationUseCase'),
    c.resolve('getReservationsByUserUseCase'),
    c.resolve('getReservationsByClassroomUseCase'),
    c.resolve('getReservationsByDateUseCase')  );
}, { singleton: true });

container.register('iotController', (c) => {
  return new IoTController(
    c.resolve('processIoTSensorDataUseCase'),
    c.resolve('getRealTimeClassroomOccupancyUseCase')
  );
}, { singleton: true });

container.register('webSocketController', (c) => {
  return new WebSocketController(
    c.resolve('realTimeService')
  );
}, { singleton: true });

console.log('Container configured with dependencies.');
export default container;