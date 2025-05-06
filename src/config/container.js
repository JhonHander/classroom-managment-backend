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

// --- Importacion de casos de uso ---
import RegisterUserUseCase from '../application/use-cases/auth/RegisterUserUseCase.js';
import LoginUserUseCase from '../application/use-cases/auth/LoginUserUseCase.js';
import VerifyTokenUseCase from '../application/use-cases/auth/VerifyTokenUseCase.js';

// --- Importación de controladores ---
import UserController from '../interfaces/controllers/UserController.js';

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
        models.ClassroomFeatureModel
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
        models.ClassroomModel
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
    return new JsonWebTokenService(secret, expiresIn);
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

// 5. Casos de Uso
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

// 6. Controladores
container.register('userController', (c) => { // por que esto es singleton?
  return new UserController(
    c.resolve('registerUserUseCase'),
    c.resolve('loginUserUseCase')
  );
}, { singleton: true });

console.log('Container configured with dependencies.');
export default container;