/**
 * WebSocketClientTest.js
 * Cliente para probar la integración con el WebSocketController
 */
import { io } from 'socket.io-client';

// Configuración
const SERVER_URL = 'http://localhost:3000';
const CLASSROOM_ID = 'classroom123';
const USER_ID = 'user456';

// Función para esperar un tiempo específico
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  console.log(`Iniciando cliente de prueba para WebSocket en ${SERVER_URL}`);
  
  try {
    // Conectar al servidor
    const socket = io(SERVER_URL, {
      transports: ['websocket']
    });
    
    // Manejar evento de conexión
    socket.on('connect', () => {
      console.log(`Conectado al servidor. Socket ID: ${socket.id}`);
    });
    
    // Manejar evento de desconexión
    socket.on('disconnect', (reason) => {
      console.log(`Desconectado del servidor: ${reason}`);
    });
    
    // Manejar evento de error de conexión
    socket.on('connect_error', (error) => {
      console.error(`Error de conexión: ${error.message}`);
    });
    
    // Esperar a que se establezca la conexión
    await new Promise((resolve) => {
      if (socket.connected) {
        resolve();
      } else {
        socket.once('connect', resolve);
      }
    });
    
    console.log('\n--- Realizando pruebas de comunicación ---');
    
    // 1. Prueba de ping
    console.log('\n1. Prueba de ping:');
    const pingResult = await new Promise((resolve) => {
      const startTime = Date.now();
      socket.emit('ping', (response) => {
        const latency = Date.now() - startTime;
        resolve({ response, latency });
      });
    });
    console.log(`Ping completado en ${pingResult.latency}ms`);
    console.log('Respuesta:', pingResult.response);
    
    // 2. Registro de usuario
    console.log('\n2. Prueba de registro de usuario:');
    socket.on('user-registered', (data) => {
      console.log('Usuario registrado:', data);
    });
    socket.emit('register-user', { userId: USER_ID });
    await wait(500); // Esperar respuesta
    
    // 3. Unirse a un aula
    console.log('\n3. Prueba de unirse a un aula:');
    socket.on('joined-classroom', (data) => {
      console.log('Unido al aula:', data);
    });
    socket.emit('join-classroom', CLASSROOM_ID);
    await wait(500); // Esperar respuesta
    
    // 4. Suscribirse a actualizaciones de ocupación
    console.log('\n4. Prueba de suscripción a ocupación:');
    socket.emit('subscribe-occupancy-updates');
    console.log('Suscrito a actualizaciones de ocupación');
    
    // 5. Configurar listeners para eventos esperados
    console.log('\n5. Configurando listeners para eventos:');
    
    socket.on('occupancy-changed', (data) => {
      console.log('Evento recibido - occupancy-changed:', data);
    });
    
    socket.on('classroom-occupancy-changed', (data) => {
      console.log('Evento recibido - classroom-occupancy-changed:', data);
    });
    
    socket.on('availability-updated', (data) => {
      console.log('Evento recibido - availability-updated:', data);
    });
    
    socket.on('reservation-changed', (data) => {
      console.log('Evento recibido - reservation-changed:', data);
    });
    
    socket.on('your-reservation-changed', (data) => {
      console.log('Evento recibido - your-reservation-changed:', data);
    });
    
    console.log('Listeners configurados, esperando eventos...');
    console.log('\nMantén este cliente ejecutándose y prueba enviar eventos desde el servidor.');
    console.log('Presiona Ctrl+C para salir.');
    
    // Mantener la conexión abierta
    await new Promise(() => {}); // Promise que nunca se resuelve
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar el test
runTest().catch(console.error);
