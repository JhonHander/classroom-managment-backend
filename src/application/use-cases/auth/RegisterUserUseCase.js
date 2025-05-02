import User from '../../../domain/entities/User.js';

export class RegisterUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async ejecutar({ name, lastName, email, password, role }) {
    // Paso 1: verificar si ya existe un usuario con ese correo
    const existente = await this.userRepository.findByEmail(email);
    if (existente) {
      throw new Error('Ya existe un usuario con ese correo');
    }

    // Paso 2: (futuro) aquí irá el hash de la contraseña
    // const hashedPassword = await this.hashingService.hash(password);

    // Paso 3: Crear la entidad del dominio
    const nuevoUsuario = new User({
      name,
      lastName,
      email,
      password, // más adelante será: hashedPassword
      role
    });

    // Paso 4: Guardar el usuario en la base de datos
    const guardado = await this.userRepository.create(nuevoUsuario);

    // Paso 5: Devolver el usuario creado
    return guardado;
  }
}
