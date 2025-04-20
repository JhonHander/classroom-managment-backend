import { sequelize } from './database.js';

// --- Importa TODOS tus modelos ---
import RoleModel from '../infrastructure/db/models/RoleModel.js';
import UserModel from '../infrastructure/db/models/UserModel.js';
import ScheduleModel from '../infrastructure/db/models/ScheduleModel.js';
import ClassroomTypeModel from '../infrastructure/db/models/ClassroomTypeModel.js';
import ClassroomFeatureModel from '../infrastructure/db/models/ClassroomFeatureModel.js';
import ClassroomModel from '../infrastructure/db/models/ClassroomModel.js';
import ReservationStatusModel from '../infrastructure/db/models/ReservationStatusModel.js';
import ReservationModel from '../infrastructure/db/models/ReservationModel.js';
import SensorModel from '../infrastructure/db/models/SensorModel.js';

// --- Importa TODAS tus implementaciones de Repositorio ---
import { SequelizeClassroomRepository } from '../infrastructure/repositories/SequelizeClassroomRepository.js';
import { SequelizeUserRepository } from '../infrastructure/repositories/SequelizeUserRepository.js'; // Asegúrate de crear este archivo
// ... importa los demás repositorios (Reservation, Schedule, etc.) ...

// --- Importa tus Mappers (Opcional si los registras) ---
// import { ClassroomMapper } from '../infrastructure/mappers/ClassroomMapper.js';

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
        // console.log(`Dependency registered: ${name} (Singleton: ${options.singleton})`); // Puedes comentar esto en producción
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
container.register('RoleModel', RoleModel, { singleton: true });
container.register('UserModel', UserModel, { singleton: true });
container.register('ScheduleModel', ScheduleModel, { singleton: true });
container.register('ClassroomTypeModel', ClassroomTypeModel, { singleton: true });
container.register('ClassroomFeatureModel', ClassroomFeatureModel, { singleton: true });
container.register('ClassroomModel', ClassroomModel, { singleton: true });
container.register('ReservationStatusModel', ReservationStatusModel, { singleton: true });
container.register('ReservationModel', ReservationModel, { singleton: true });
container.register('SensorModel', SensorModel, { singleton: true });

// 3. Mappers (Generalmente no necesitan ser singletons ni registrados, se usan estáticamente)
// container.register('ClassroomMapper', ClassroomMapper); // Opcional

// 4. Repositorios (Singletons, inyectando modelos)
container.register('classroomRepository', (c) => {
    return new SequelizeClassroomRepository(
        c.resolve('ClassroomModel'),
        c.resolve('ClassroomTypeModel'),
        c.resolve('ClassroomFeatureModel')
        // No necesitas inyectar el Mapper si sus métodos son estáticos
    );
}, { singleton: true });

container.register('userRepository', (c) => {
    return new SequelizeUserRepository(
        c.resolve('UserModel'),
        c.resolve('RoleModel') // El repositorio de usuario necesita el modelo Role para incluirlo
    );
}, { singleton: true });

// --- Registra aquí los demás repositorios (Reservation, Schedule, etc.) ---
// container.register('reservationRepository', (c) => new SequelizeReservationRepository(...), { singleton: true });
// container.register('scheduleRepository', (c) => new SequelizeScheduleRepository(...), { singleton: true });
// ...

// 5. Casos de Uso (No suelen ser singletons, inyectando repositorios)
// Se registrarán cuando los crees en src/application/use_cases
/*
import { CreateClassroomUseCase } from '../application/use_cases/CreateClassroomUseCase.js';
container.register('createClassroomUseCase', (c) => {
    return new CreateClassroomUseCase(c.resolve('classroomRepository'));
});
*/

console.log('Container configured with dependencies.');
export default container;