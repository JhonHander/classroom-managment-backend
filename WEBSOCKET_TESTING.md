# Pruebas WebSocket para Classroom Management

Este documento explica cómo realizar pruebas de las funcionalidades WebSocket del sistema de gestión de aulas.

## Descripción

El sistema utiliza WebSockets (Socket.IO) para proporcionar actualizaciones en tiempo real sobre:
- Ocupación de aulas (basada en sensores IoT)
- Cambios en reservas
- Disponibilidad de aulas

## Herramientas de prueba incluidas

1. **Manual Test Script** (`manualWebSocketTest.js`): Prueba unitaria manual que verifica el funcionamiento del WebSocketController con un mock del servicio Socket.IO.

2. **Testing Server** (`WebSocketServerTest.js`): Servidor interactivo que implementa WebSocketController con un servicio Socket.IO simplificado para pruebas. Permite enviar eventos manualmente.

3. **Testing Client** (`WebSocketClientTest.js`): Cliente de prueba que se conecta al servidor y recibe eventos.

4. **HTML Test Client** (`test-client.html`): Interfaz web para probar la comunicación WebSocket desde un navegador.

## Cómo ejecutar las pruebas

### 1. Prueba unitaria manual

```bash
node manualWebSocketTest.js
```

Esta prueba simula el funcionamiento del controlador WebSocket sin necesidad de un servidor real.

### 2. Pruebas de integración con servidor y cliente

#### Ejecutar el servidor de prueba:
```bash
node WebSocketServerTest.js
```

El servidor mostrará un menú interactivo con opciones del 1 al 5:
- `1`: Enviar notificación de cambio de ocupación
- `2`: Enviar notificación de cambio de reserva
- `3`: Enviar notificación de actualización de disponibilidad
- `4`: Mostrar estadísticas
- `5`: Salir

#### Ejecutar el cliente de prueba (en otra terminal):
```bash
node WebSocketClientTest.js
```

El cliente se conectará al servidor, se registrará como usuario y se unirá a un aula. Luego esperará eventos del servidor.

### 3. Prueba con cliente web

1. Abra el archivo `test-client.html` en un navegador.
2. Configure la URL del servidor (por defecto: `http://localhost:3000`).
3. Haga clic en "Conectar".
4. Realice diferentes acciones (registro, unirse a aulas, etc.) y observe los eventos recibidos.

## Eventos WebSocket disponibles

### Eventos del cliente al servidor:

| Evento | Descripción | Parámetros |
|--------|-------------|------------|
| `ping` | Verifica la conexión con el servidor | Callback para recibir respuesta |
| `register-user` | Registra un usuario para recibir notificaciones | `{ userId: string }` |
| `join-classroom` | Suscribe al cliente a actualizaciones de un aula específica | `classroomId: string` |
| `leave-classroom` | Cancela la suscripción a un aula | `classroomId: string` |
| `subscribe-occupancy-updates` | Suscribe a actualizaciones generales de ocupación | - |
| `unsubscribe-occupancy-updates` | Cancela suscripción a actualizaciones de ocupación | - |
| `subscribe-reservation-updates` | Suscribe a actualizaciones de reservas | `userId?: string` (opcional) |
| `unsubscribe-reservation-updates` | Cancela suscripción a actualizaciones de reservas | `userId?: string` (opcional) |

### Eventos del servidor al cliente:

| Evento | Descripción | Datos |
|--------|-------------|-------|
| `user-registered` | Confirmación de registro de usuario | `{ status, userId, socketId }` |
| `joined-classroom` | Confirmación de unión a sala de aula | `{ status, classroomId, room }` |
| `occupancy-changed` | Notificación general de cambio de ocupación | `{ classroomId, isOccupied, source, confidence, timestamp }` |
| `classroom-occupancy-changed` | Notificación específica de cambio de ocupación | `{ classroomId, isOccupied, source, confidence, timestamp }` |
| `reservation-changed` | Notificación general de cambio de reserva | `{ id, classroomId, status, userId, timestamp, ... }` |
| `your-reservation-changed` | Notificación de cambio en reserva del usuario | `{ id, classroomId, status, userId, timestamp, ... }` |
| `availability-updated` | Notificación de actualización de disponibilidad | `{ classrooms: Array, timestamp }` |

## Tips para debugging

1. Los logs en la consola del servidor muestran conexiones y emisiones de eventos.
2. El cliente web muestra un registro detallado de todos los eventos.
3. Para simular un cambio de ocupación desde el servidor: use la opción 1.
4. Para probar la recepción de notificaciones específicas: suscríbase al aula "classroom123" y al usuario "user456".

## Integración con la aplicación principal

El WebSocketController se integra con la aplicación principal a través del contenedor de dependencias (container.js) y se inicializa en server.js cuando se inicia la aplicación.
