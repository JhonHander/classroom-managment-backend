import container from '../../config/container.js';

/**
 * Middleware para autenticar solicitudes usando JWT
 * @returns {Function} Función middleware de Express
 */
export const authenticate = () => {
  return async (req, res, next) => {
    try {
      // Obtener el token del encabezado de autorización
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false, 
          message: 'Error de autenticación. No se proporcionó token.',
          code: 'TOKEN_MISSING'
        });
      }

      // Extraer el token (eliminar el prefijo "Bearer ")
      const token = authHeader.split(' ')[1];
      
      // Verificar el token usando nuestro VerifyTokenUseCase
      const verifyTokenUseCase = container.resolve('verifyTokenUseCase');
      const result = await verifyTokenUseCase.execute(token);

      if (!result.success) {
        return res.status(401).json({ 
          success: false, 
          message: result.message || 'Token inválido',
          code: 'TOKEN_INVALID'
        });
      }

      // Adjuntar los datos del usuario al objeto de solicitud
      req.user = result.data;
      next();
    } catch (error) {
      console.error('Error en el middleware de autenticación:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error de autenticación',
        code: 'AUTH_ERROR'
      });
    }
  };
};

/**
 * Middleware para autorizar usuarios según sus roles
 * @param {Array} roles - Array de nombres de roles autorizados
 * @returns {Function} Función middleware de Express
 */
export const authorizeRoles = (roles = []) => {
  return (req, res, next) => {
    try {
      // Verificar si el usuario existe en la solicitud (debería ser agregado por el middleware de autenticación)
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado', 
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      // Si no se especifican roles, permitir el acceso a todos los usuarios autenticados
      if (roles.length === 0) {
        return next();
      }

      // Verificar si el rol del usuario está en la lista de roles permitidos
      const userRole = req.user.role?.name;
      
      console.log('User role:', userRole);
      console.log('Required roles:', roles);
      
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ 
          success: false, 
          message: 'No autorizado. Permisos insuficientes.',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // El usuario está autorizado, continuar
      next();
    } catch (error) {
      console.error('Error en la autorización de roles:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error de autorización',
        code: 'AUTHORIZATION_ERROR'
      });
    }
  };
};