# Documentación de WebSocket (Socket.IO)

## Tecnología Utilizada
- **Biblioteca**: Socket.IO
- **Implementación Backend**: `SocketIOService` - Servicio que encapsula las funcionalidades de Socket.IO

## Configuración y Puerto
- **Puerto**: El servicio WebSocket utiliza el mismo puerto que el servidor HTTP principal (por defecto 3000, configurable mediante la variable de entorno `PORT`)
- **CORS**: Configurado para aceptar conexiones desde todos los orígenes (`*`) o desde la URL especificada en la variable de entorno `CLIENT_URL`
- **Métodos permitidos**: GET y POST

## Autenticación y Seguridad
El sistema utiliza un método de autenticación de dos pasos:
1. **Conexión Inicial**: La conexión inicial al WebSocket no requiere autenticación
2. **Registro de Usuario**: Una vez conectado, el cliente debe autenticarse mediante:
   - Evento `authenticate` con los datos del usuario (`userId`)
   - Alternativamente, puede usar el evento `register-user` con la misma información

El usuario debe primero obtener un token JWT válido utilizando las APIs REST del sistema. Este token no se valida directamente en la conexión WebSocket, pero debería ser utilizado para obtener el ID del usuario autenticado.

## Eventos Disponibles (Cliente a Servidor)

### Eventos de Conexión
- `authenticate`: Registra un usuario autenticado y lo une a una sala personalizada
  ```javascript
  socket.emit('authenticate', { userId: 'userId' });
  ```

- `register-user`: Registra un usuario autenticado (alternativo a 'authenticate')
  ```javascript
  socket.emit('register-user', { userId: 'userId' });
  ```

- `ping`: Comprueba si la conexión está activa y obtiene información del servidor
  ```javascript
  socket.emit('ping', (callback) => {
    console.log(callback); // { status: 'success', time: Date, socketId: 'socket-id' }
  });
  ```

### Eventos de Salas (Aulas)
- `join-classroom`: Suscribe al cliente a una sala específica de aula para recibir notificaciones
  ```javascript
  socket.emit('join-classroom', classroomId);
  ```

- `leave-classroom`: Cancela la suscripción a una sala de aula
  ```javascript
  socket.emit('leave-classroom', classroomId);
  ```

### Eventos de Ocupación
- `subscribe-occupancy-updates`: Suscribe al cliente a actualizaciones de ocupación de todas las aulas
  ```javascript
  socket.emit('subscribe-occupancy-updates');
  ```

- `unsubscribe-occupancy-updates`: Cancela la suscripción a actualizaciones de ocupación
  ```javascript
  socket.emit('unsubscribe-occupancy-updates');
  ```

### Eventos de Reservas
- `subscribe-reservation-updates`: Suscribe al cliente a actualizaciones de reservas
  ```javascript
  // Para todas las reservas
  socket.emit('subscribe-reservation-updates');
  
  // Para reservas de un usuario específico
  socket.emit('subscribe-reservation-updates', userId);
  ```

- `unsubscribe-reservation-updates`: Cancela la suscripción a actualizaciones de reservas
  ```javascript
  // Para todas las reservas
  socket.emit('unsubscribe-reservation-updates');
  
  // Para reservas de un usuario específico
  socket.emit('unsubscribe-reservation-updates', userId);
  ```

## Eventos Recibidos (Servidor a Cliente)

- `user-registered`: Confirmación de registro exitoso
  ```javascript
  // { status: 'success', userId: 'userId', socketId: 'socket-id' }
  ```

- `joined-classroom`: Confirmación de suscripción a sala de aula
  ```javascript
  // { status: 'success', classroomId: 'classroom-id', room: 'classroom-{id}' }
  ```

- `occupancy-changed`: Notificación de cambio en la ocupación de aulas (para suscriptores globales)
  ```javascript
  // { timestamp: Date, classroomId: 'classroom-id', ... (datos adicionales) }
  ```

- `classroom-occupancy-changed`: Notificación de cambio en la ocupación de un aula específica
  ```javascript
  // { timestamp: Date, classroomId: 'classroom-id', ... (datos adicionales) }
  ```

- `reservation-changed`: Notificación de cambio en reservas (para suscriptores globales)
  ```javascript
  // { timestamp: Date, ... (datos de la reserva) }
  ```

- `your-reservation-changed`: Notificación específica para un usuario sobre cambios en sus reservas
  ```javascript
  // { timestamp: Date, ... (datos de la reserva) }
  ```

- `availability-updated`: Notificación global sobre actualización en la disponibilidad de aulas
  ```javascript
  // { timestamp: Date, classrooms: [ ... (datos de disponibilidad) ] }
  ```

## Métodos de la Clase SocketIOService

La clase `SocketIOService` proporciona los siguientes métodos para interactuar con el WebSocket:

- `init(httpServer)`: Inicializa el servicio Socket.IO con un servidor HTTP
- `broadcast(event, data)`: Emite un evento a todos los clientes conectados
- `emitToRoom(room, event, data)`: Emite un evento a una sala específica
- `emitToUser(userId, event, data)`: Emite un evento a un usuario específico
- `getClientsCountInRoom(room)`: Obtiene el número de clientes conectados a una sala
- `getStats()`: Obtiene estadísticas del servicio (clientes conectados, estado, etc.)

## Ejemplos de Conexión desde un Cliente

### Usando JavaScript/Node.js
```javascript
import { io } from "socket.io-client";

// Conectar al WebSocket
const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  autoConnect: true
});

// Manejar conexión exitosa
socket.on("connect", () => {
  console.log("Conectado al servidor WebSocket con ID:", socket.id);
  
  // Autenticar al usuario una vez conectado
  socket.emit("authenticate", { userId: "usuario-123" });
  
  // Suscribirse a actualizaciones de un aula específica
  socket.emit("join-classroom", "aula-101");
});

// Manejar eventos recibidos del servidor
socket.on("classroom-occupancy-changed", (data) => {
  console.log("Actualización de ocupación del aula:", data);
});

socket.on("your-reservation-changed", (data) => {
  console.log("Tu reserva ha sido actualizada:", data);
});

// Manejar desconexiones
socket.on("disconnect", (reason) => {
  console.log("Desconectado del servidor WebSocket:", reason);
});
```

### Usando un Cliente Web (HTML/JavaScript)
```html
<script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
<script>
  // Conectar al WebSocket del servidor
  const socket = io("http://localhost:3000");
  
  // Al conectarse exitosamente
  socket.on("connect", () => {
    console.log("Conectado al WebSocket");
    
    // Autenticar con el ID de usuario (obtenido previamente del login)
    const userId = localStorage.getItem("userId");
    socket.emit("register-user", { userId: userId });
    
    // También suscribirse a sus propias notificaciones de reservas
    socket.emit("subscribe-reservation-updates", userId);
  });
  
  // Recibir notificaciones
  socket.on("your-reservation-changed", (data) => {
    // Mostrar notificación al usuario
    showNotification("Tu reserva ha sido actualizada", data);
  });
</script>
```

## Consejos para la Implementación
- Siempre manejar los eventos de desconexión para identificar problemas de red
- Implementar lógica de reconexión automática en el cliente
- Autenticar al usuario después de cada reconexión exitosa
- Verificar el estado de la conexión con el evento `ping` si se sospecha de problemas
