import nodemailer from 'nodemailer';
import INotificationService from '../../application/ports/INotificationService.js';
import path from 'path'; 
import fs from 'fs/promises';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';

// Obtener directorio actual para resolver las rutas de plantillas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailNotificationService extends INotificationService {
    constructor(host, port, user, pass, defaultFrom, nodeEnv, frontendUrl) {
        super();
        this.defaultFrom = defaultFrom || '"Sistema de Reserva de Aulas IUE" <no-reply@example.com>';
        this.frontendUrl = frontendUrl || 'http://localhost:3000'; // URL por defecto para desarrollo
        this.nodeEnv = nodeEnv;
        this.isTestAccount = false;
        this.templates = {};
        this.images = {}; // Para almacenar imágenes codificadas en base64
        
        this.setupTransporter(host, port, user, pass);
        this.loadResources(); // Cargamos plantillas e imágenes al inicializar
    }
    
    async setupTransporter(host, port, user, pass) {
        // Para desarrollo, crear una cuenta de prueba de Ethereal si no hay credenciales válidas
        if (this.nodeEnv === 'development' && (!user || user === 'ethereal.user@ethereal.email')) {
            try {
                console.log('Creating Ethereal test account for email testing...');
                const testAccount = await nodemailer.createTestAccount();
                this.isTestAccount = true;
                
                // Usar las credenciales de prueba generadas
                host = 'smtp.ethereal.email';
                port = 587;
                user = testAccount.user;
                pass = testAccount.pass;
                
                console.log('Ethereal test account created:');
                console.log(`- Username: ${testAccount.user}`);
                console.log(`- Password: ${testAccount.pass}`);
                console.log('You can view sent emails at https://ethereal.email');
            } catch (error) {
                console.error('Failed to create Ethereal test account:', error);
            }
        }

        // Configura el transporter de nodemailer
        const transporterOptions = {
            host: host,
            port: parseInt(port || "587", 10), // Puerto común para TLS
            secure: parseInt(port || "587", 10) === 465, // true para 465, false para otros
            auth: {
                user: user, // Usuario SMTP
                pass: pass, // Contraseña SMTP
            },

            ...(this.nodeEnv === 'development' && {
                tls: {
                    rejectUnauthorized: false // ¡Solo para desarrollo!
                }
            })
        };

        this.transporter = nodemailer.createTransport(transporterOptions);

        try {
            await this.transporter.verify();
            console.log('Email transporter is ready');
        } catch (error) {
            console.error('Error configuring email transporter:', error);
        }
    }

    // Método para cargar recursos (plantillas e imágenes)
    async loadResources() {
        try {
            // Cargar imágenes
            await this.loadImages();
            
            // Registrar helpers de Handlebars para imágenes
            Handlebars.registerHelper('getImage', (imageName) => {
                return this.images[imageName] || '';
            });
            
            // Cargar plantillas
            await this.loadTemplates();
            
            console.log('Email resources loaded successfully');
        } catch (error) {
            console.error('Failed to load email resources:', error);
        }
    }

    // Método para cargar imágenes y convertirlas a base64
    async loadImages() {
        try {
            const imageDir = path.join(__dirname, 'templates', 'images');
            
            // Cargar logo IUE
            const logoPath = path.join(imageDir, 'logo-iue.png');
            const logoBuffer = await fs.readFile(logoPath);
            const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
            this.images.logoIUE = logoBase64;
            
            console.log('Email images loaded successfully');
        } catch (error) {
            console.error('Failed to load email images:', error);
        }
    }

    // Método para cargar las plantillas de correo electrónico
    async loadTemplates() {
        try {
            const templateDir = path.join(__dirname, 'templates', 'email');
            // Cargamos la plantilla de bienvenida
            const welcomeTemplateContent = await fs.readFile(path.join(templateDir, 'welcome.html'), 'utf8');
            this.templates.welcome = Handlebars.compile(welcomeTemplateContent);
            
            console.log('Email templates loaded successfully');
            // Podemos cargar más plantillas aquí a medida que se vayan creando
        } catch (error) {
            console.error('Failed to load email templates:', error);
            // No lanzamos error para permitir la operación sin plantillas como fallback
        }
    }

    async _sendEmail(to, subject, htmlContent) {
        const mailOptions = {
            from: this.defaultFrom,
            to: to,
            subject: subject,
            html: htmlContent,
        };
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Email '${subject}' sent to ${to}: ${info.messageId}`);
            
            // Si estamos usando una cuenta de prueba de Ethereal, mostrar la URL para ver el email
            if (this.isTestAccount) {
                console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            
            return info;
        } catch (error) {
            console.error(`Error sending email '${subject}' to ${to}:`, error);
            throw error; // Relanzamos el error para manejarlo en el caso de uso
        }
    }

    async sendReservationThankYouEmail(email, reservationDetails) {
        const subject = 'Confirmación de Reserva de Aula';
        // **Mejora:** Usar una plantilla
        // const body = this.thankYouTemplate ? this.thankYouTemplate({ reservationDetails }) : 'Fallback content';
        const body = `
            <h1>¡Reserva Confirmada!</h1>
            <p>Hola,</p>
            <p>Tu reserva para el aula ${reservationDetails.classroom?.fullName || 'desconocida'} ha sido confirmada.</p>
            <p>Fecha: ${reservationDetails.date}</p>
            <p>Hora: ${reservationDetails.startTime} - ${reservationDetails.endTime}</p>
            <p>¡Gracias!</p>
        `; // Contenido actual como fallback
        await this._sendEmail(email, subject, body);
    }

    // async sendPasswordResetEmail(email, resetToken) {
    //     const subject = 'Restablecimiento de Contraseña';
    //     // Usar la URL del frontend inyectada
    //     if (!this.frontendUrl) {
    //          console.error("FRONTEND_URL no está configurado para enviar email de reseteo.");
    //          return; // O lanzar error
    //     }
    //     const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;
    //     // **Mejora:** Usar una plantilla
    //     const body = `
    //         <h1>Restablecer Contraseña</h1>
    //         <p>Hola,</p>
    //         <p>Recibiste este correo porque solicitaste restablecer tu contraseña.</p>
    //         <p>Haz clic en el siguiente enlace para continuar:</p>
    //         <p><a href="${resetUrl}">${resetUrl}</a></p>
    //         <p>Si no solicitaste esto, puedes ignorar este correo.</p>
    //     `;
    //     await this._sendEmail(email, subject, body);
    // }

    async sendRegistrationThankYouEmail(email, userName) {
        const subject = '¡Bienvenido a Classroom App!';

        let htmlContent;
        
        // Usar la plantilla si está disponible, o caer de vuelta al contenido básico
        if (this.templates.welcome) {
            const currentYear = new Date().getFullYear();
            htmlContent = this.templates.welcome({
                name: userName || 'Usuario',
                loginUrl: `${this.frontendUrl}`,
                year: currentYear
            });
        } else {
            // Contenido básico como fallback
            htmlContent = `
                <h1>¡Registro Exitoso!</h1>
                <p>Hola ${userName || ''},</p>
                <p>Gracias por registrarte en nuestra aplicación de gestión de aulas.</p>
                <p>Ahora puedes iniciar sesión y empezar a reservar aulas.</p>
            `;
        }
        
        await this._sendEmail(email, subject, htmlContent);
    }

    async sendReservationReminderEmail(email, reservationDetails) {
        const subject = 'Recordatorio de Reserva de Aula';
        // En el futuro, implementar una plantilla específica para recordatorios
        const body = `
            <h1>Recordatorio</h1>
            <p>Hola,</p>
            <p>Solo un recordatorio de tu próxima reserva para el aula ${reservationDetails.classroom?.fullName || 'desconocida'}.</p>
            <p>Fecha: ${reservationDetails.date}</p>
            <p>Hora: ${reservationDetails.startTime} - ${reservationDetails.endTime}</p>
            <p>¡Nos vemos pronto!</p>
        `;
        await this._sendEmail(email, subject, body);
    }
}

export default EmailNotificationService;