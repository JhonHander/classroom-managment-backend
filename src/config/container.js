// filepath: c:\Users\jhonh\OneDrive\Escritorio\Clases_U\programacion_movil\classroom-managment-backend\src\config\container.js
import { sequelize } from './database.js';
// Importa tus futuras implementaciones de repositorios y casos de uso aquí
// import { SequelizeUserRepository } from '../infrastructure/repositories/SequelizeUserRepository.js';
// import { CreateUserUseCase } from '../application/use_cases/CreateUserUseCase.js';

class AppContainer {
    constructor() {
        this._dependencies = {};
        this._singletons = {}; // Opcional: para manejar singletons
    }

    register(name, definition, options = { singleton: false }) {
        if (options.singleton) {
            // Si es singleton, registra la definición pero no la instancia aún
            this._dependencies[name] = { definition, singleton: true };
        } else {
            this._dependencies[name] = { definition, singleton: false };
        }
        console.log(`Dependency registered: ${name} (Singleton: ${options.singleton})`);
    }

    resolve(name) {
        const registration = this._dependencies[name];

        if (!registration) {
            throw new Error(`Dependency not found: ${name}`);
        }

        const { definition, singleton } = registration;

        if (singleton) {
            // Si es singleton y ya está instanciado, devuélvelo
            if (this._singletons[name]) {
                return this._singletons[name];
            }
            // Si es singleton y no está instanciado, créalo y guárdalo
            const instance = typeof definition === 'function' ? definition(this) : definition;
            this._singletons[name] = instance;
            return instance;
        }

        // Si no es singleton, crea/devuelve la instancia
        if (typeof definition === 'function') {
            return definition(this); // Pasa el contenedor a la fábrica
        }

        return definition; // Devuelve la instancia/valor directamente
    }
}

const container = new AppContainer();

// --- Registro de Dependencias Reales ---

// 1. Registrar la instancia de Sequelize (como singleton)
container.register('sequelize', sequelize, { singleton: true });

// 2. Registrar Modelos (si los defines por separado y los necesitas explícitamente)
//    Ejemplo (asumiendo que defines modelos Sequelize en infrastructure/models):
//    import UserModel from '../infrastructure/models/UserModel.js';
//    container.register('UserModel', UserModel, { singleton: true }); // Los modelos suelen ser singletons

// 3. Registrar Implementaciones de Repositorios (como fábricas)
//    Esto se hará cuando crees las clases en infrastructure/repositories
/*
import { SequelizeUserRepository } from '../infrastructure/repositories/SequelizeUserRepository.js';
container.register('userRepository', (c) => {
    // const userModel = c.resolve('UserModel'); // Si registraste el modelo
    // return new SequelizeUserRepository(userModel);
    return new SequelizeUserRepository(c.resolve('sequelize')); // O pasa sequelize directamente
}, { singleton: true }); // Los repositorios suelen ser singletons
*/

// 4. Registrar Casos de Uso (como fábricas)
//    Esto se hará cuando crees las clases en application/use_cases
/*
import { RegisterUserUseCase } from '../application/use_cases/RegisterUserUseCase.js';
container.register('registerUserUseCase', (c) => {
    const userRepository = c.resolve('userRepository');
    return new RegisterUserUseCase(userRepository);
}); // Los casos de uso no suelen ser singletons
*/


export default container;