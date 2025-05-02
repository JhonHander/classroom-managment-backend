import container from '../../config/container.js';

export const registerUser = async (req, res) => {
  const { name, lastName, email, password, role } = req.body;

  try {
    const useCase = container.resolve('registerUserUseCase');

    const usuarioCreado = await useCase.ejecutar({
      name,
      lastName,
      email,
      password,
      role
    });

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: {
        id: usuarioCreado.id,
        fullName: usuarioCreado.full_name,
        email: usuarioCreado.email,
        role: usuarioCreado.whatsTheRole()
      }
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
