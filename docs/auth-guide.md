# Guía de Autenticación y Autorización

Esta guía explica cómo utilizar la autenticación y autorización implementada en la API de gestión de reservas de aulas.

## Conceptos clave

El sistema utiliza:
- **JWT (JSON Web Tokens)** para la autenticación de usuarios
- **Autorización basada en roles** para controlar el acceso a los recursos
- **Sistema de refreshing tokens** para mantener la sesión activa sin comprometer la seguridad

## Roles y permisos

El sistema maneja tres roles principales:

1. **Admin**
   - Acceso completo a todos los recursos
   - Puede ver, crear, editar y cancelar cualquier reserva
   - Puede ver todas las aulas y sus detalles

2. **Teacher** (Profesor)
   - Puede ver todas las aulas y sus detalles
   - Puede ver todas las reservas para una fecha específica
   - Puede ver todas las reservas para un aula específica
   - Puede actualizar y cancelar cualquier reserva

3. **Student** (Estudiante)
   - Puede ver la lista general de aulas
   - Solo puede acceder a sus propias reservas
   - Puede crear, editar y cancelar sus propias reservas

## Uso de la API de autenticación

### 1. Registro de usuario

```
POST /api/users/register
```

**Body**:
```json
{
  "name": "Nombre Completo",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa** (Código 201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "Nombre Completo",
    "email": "usuario@ejemplo.com",
    "role": {
      "id": 3,
      "name": "student"
    }
  }
}
```

### 2. Inicio de sesión

```
POST /api/users/login
```

**Body**:
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa** (Código 200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Nombre Completo",
      "email": "usuario@ejemplo.com",
      "role": {
        "id": 3,
        "name": "student"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Uso del access token

Para hacer peticiones a endpoints protegidos, incluye el access token en el header de autorización:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Actualizar un token expirado

Cuando el access token expire, puedes obtener uno nuevo utilizando el refresh token:

```
POST /api/users/refresh-token
```

**Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa** (Código 200):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Nombre Completo",
      "email": "usuario@ejemplo.com",
      "role": {
        "id": 3,
        "name": "student"
      }
    }
  }
}
```

## Configuración en Postman

Para facilitar el uso de la API con Postman, sigue estos pasos:

### 1. Configurar variables de entorno

1. Crea un nuevo entorno en Postman (por ejemplo, "ClassroomAPI")
2. Añade las siguientes variables:
   - `baseUrl`: URL base de la API (ej. `http://localhost:3000/api`)
   - `accessToken`: Dejarlo vacío inicialmente
   - `refreshToken`: Dejarlo vacío inicialmente

### 2. Crear una colección para la API

1. Crea una nueva colección
2. Configura la autenticación a nivel de colección:
   - Tipo: Bearer Token
   - Token: `{{accessToken}}`

### 3. Crear un script para automatizar el login y el almacenamiento de tokens

Puedes crear una solicitud de login con el siguiente script en la pestaña "Tests":

```javascript
// Parse la respuesta
var response = pm.response.json();

// Si el login es exitoso, guarda los tokens
if (response.success && response.data.accessToken) {
    pm.environment.set("accessToken", response.data.accessToken);
    pm.environment.set("refreshToken", response.data.refreshToken);
    console.log("Tokens guardados correctamente");
}
```

### 4. Crear una solicitud para refrescar el token

Puedes crear una solicitud de refresh token con el siguiente script en la pestaña "Tests":

```javascript
// Parse la respuesta
var response = pm.response.json();

// Si el refresh es exitoso, actualiza el access token
if (response.success && response.data.accessToken) {
    pm.environment.set("accessToken", response.data.accessToken);
    console.log("Access token actualizado correctamente");
}
```

### 5. Manejo de errores de autorización

Si recibes un error 401 (Unauthorized), probablemente necesites refrescar tu token. Puedes automatizar esto añadiendo un script en la pestaña "Tests" de tus peticiones:

```javascript
// Comprobar si el token ha expirado
if (pm.response.code === 401) {
    console.log("Token expirado. Intentando refrescar...");
    
    // Enviar solicitud para refrescar token
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + '/users/refresh-token',
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({ refreshToken: pm.environment.get("refreshToken") })
        }
    }, function (err, res) {
        if (!err && res.code === 200) {
            var refreshResponse = res.json();
            if (refreshResponse.success) {
                // Actualizar token
                pm.environment.set("accessToken", refreshResponse.data.accessToken);
                console.log("Token refrescado correctamente. Intenta la solicitud de nuevo.");
            }
        } else {
            console.log("Error al refrescar token. Necesitas iniciar sesión de nuevo.");
        }
    });
}
```

## Solución de problemas comunes

### Error 401 (Unauthorized)

Posibles causas:
- Token no proporcionado en la cabecera
- Token expirado
- Token inválido o manipulado

Solución:
- Verifica que estás incluyendo el token correctamente
- Intenta refrescar el token
- Inicia sesión de nuevo si el refresh token también ha expirado

### Error 403 (Forbidden)

Posibles causas:
- No tienes permisos suficientes para acceder al recurso
- Estás intentando acceder a un recurso que no te pertenece

Solución:
- Verifica que estás usando una cuenta con los permisos necesarios
- Asegúrate de que estás intentando acceder a recursos que corresponden a tu usuario (en caso de estudiantes)

### Error en el refresh token

Posibles causas:
- El refresh token ha expirado
- El refresh token es inválido
- El usuario ya no existe en el sistema

Solución:
- Inicia sesión de nuevo para obtener un nuevo par de tokens
- Contacta al administrador si el problema persiste
