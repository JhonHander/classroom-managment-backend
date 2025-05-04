import { sequelize } from './database.js';

// --- Importación de modelos ---
import RoleModel from '../infrastructure/db/models/RoleModel.js';
import UserModel from '../infrastructure/db/models/UserModel.js';
import ScheduleModel from '../infrastructure/db/models/ScheduleModel.js';
import ClassroomTypeModel from '../infrastructure/db/models/ClassroomTypeModel.js';
import ClassroomFeatureModel from '../infrastructure/db/models/ClassroomFeatureModel.js';
import ClassroomModel from '../infrastructure/db/models/ClassroomModel.js';
import ReservationStatusModel from '../infrastructure/db/models/ReservationStatusModel.js';
import ReservationModel from '../infrastructure/db/models/ReservationModel.js';
import SensorModel from '../infrastructure/db/models/SensorModel.js';

// --- Importación de las implementaciones de Repositorio ---
import { SequelizeClassroomRepository } from '../infrastructure/repositories/SequelizeClassroomRepository.js';
import { SequelizeReservationRepository } from '../infrastructure/repositories/SequelizeReservationRepository.js';
import { SequelizeScheduleRepository } from '../infrastructure/repositories/SequelizeScheduleRepository.js';
import { SequelizeUserRepository } from '../infrastructure/repositories/SequelizeUserRepository.js';
import { SequelizeSensorRepository } from '../infrastructure/repositories/SequelizeSensorRepository.js';

// --- Importación de Servicios ---
import { JsonWebTokenService } from '../infrastructure/services/JsonWebTokenService.js';
import { HashingService } from '../infrastructure/services/HashingService.js';
import { EmailNotificationService } from '../infrastructure/services/EmailNotificationService.js';

// --- Importacion de casos de uso ---
import { RegisterUserUseCase } from '../application/use-cases/auth/RegisterUserUseCase.js';
import { LoginUserUseCase } from '../application/use-cases/auth/LoginUserUseCase.js';
import { VerifyTokenUseCase } from '../application/use-cases/auth/VerifyTokenUseCase.js';

import dotenv from 'dotenv';

dotenv.config();

class AppContainer {
    // ... (código del constructor, register, resolve sin cambios) ...
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
        if (singleton) {
            if (!this._singletons[name]) {
                this._singletons[name] = typeof definition === 'function' ? definition(this) : definition;
            }
            return this._singletons[name];
        }
        return typeof definition === 'function' ? definition(this) : definition;
    }
}

const container = new AppContainer();

// --- Registro de Dependencias ---

// 1. Sequelize (Singleton)
container.register('sequelize', sequelize, { singleton: true });

// 2. Modelos Sequelize (Singletons)
container.register('roleModel', RoleModel, { singleton: true });
container.register('userModel', UserModel, { singleton: true });
container.register('scheduleModel', ScheduleModel, { singleton: true });
container.register('classroomTypeModel', ClassroomTypeModel, { singleton: true });
container.register('classroomFeatureModel', ClassroomFeatureModel, { singleton: true });
container.register('classroomModel', ClassroomModel, { singleton: true });
container.register('reservationStatusModel', ReservationStatusModel, { singleton: true });
container.register('reservationModel', ReservationModel, { singleton: true });
container.register('sensorModel', SensorModel, { singleton: true });

// 3. Mappers (Generalmente no necesitan ser singletons ni registrados, se usan estáticamente)
// container.register('ClassroomMapper', ClassroomMapper); // Opcional

// 4. Repositorios (Singletons, inyectando modelos)
container.register('classroomRepository', (c) => {
    return new SequelizeClassroomRepository(
        c.resolve('classroomModel'),
        c.resolve('classroomTypeModel'),
        c.resolve('classroomFeatureModel')
        // No necesitas inyectar el Mapper si sus métodos son estáticos
    );
}, { singleton: true });

container.register('reservationRepository', (c) => {
    return new SequelizeReservationRepository(
        c.resolve('reservationModel'),
        c.resolve('userModel'), // El repositorio de reserva necesita el modelo User para incluirlo
        c.resolve('classroomModel'), // El repositorio de reserva necesita el modelo Classroom para incluirlo
        c.resolve('reservationStatusModel') // El repositorio de reserva necesita el modelo ReservationStatus para incluirlo
    );
}, { singleton: true });

container.register('scheduleRepository', (c) => {
    return new SequelizeScheduleRepository(
        c.resolve('scheduleModel'),
        c.resolve('classroomModel')
    );
}, { singleton: true });

container.register('userRepository', (c) => {
    return new SequelizeUserRepository(
        c.resolve('userModel'),
        c.resolve('roleModel') // El repositorio de usuario necesita el modelo Role para incluirlo
    );
}, { singleton: true });

container.register('sensorRepository', (c) => {
    return new SequelizeSensorRepository(
        c.resolve('sensorModel'),
        c.resolve('classroomModel') // El repositorio de sensor necesita el modelo Classroom para incluirlo
    );
}, { singleton: true });

container.register('hashingService', () => {
    // Asume que HashingService también podría aceptar saltRounds
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    return new HashingService(saltRounds);
}, { singleton: true });

container.register('jwtService', () => {
    // Lee las variables de entorno aquí y pásalas al constructor
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN;
    return new JsonWebTokenService(secret, expiresIn);
}, { singleton: true });

container.register('emailNotificationService', () => {

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const defaultFrom = process.env.EMAIL_FROM;
    const nodeEnv = process.env.NODE_ENV;
    // const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Añade la URL del frontend

    return new EmailNotificationService(
        host,
        port,
        user,
        pass,
        defaultFrom,
        nodeEnv,
        // frontendUrl // Si decides usarlo, descomenta esta línea
    );
}, { singleton: true });

// 5. Casos de Uso (No suelen ser singletons, inyectando repositorios)
// Se registrarán cuando los crees en src/application/use_cases
/*
import { CreateClassroomUseCase } from '../application/use_cases/CreateClassroomUseCase.js';
container.register('createClassroomUseCase', (c) => {
    return new CreateClassroomUseCase(c.resolve('classroomRepository'));
});
*/

container.register('registerUserUseCase', (c) => {
    return new RegisterUserUseCase(
      c.resolve('userRepository'),
      c.resolve('hashingService'), // Inyectar el servicio de hashing
      c.resolve('emailNotificationService') // Inyectar el servicio de notificación
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

console.log('Container configured with dependencies.');
export default container;