import nodemailer from 'nodemailer';  // npm install nodemailer
import INotificationService from '../../application/ports/INotificationService.js';
// import path from 'path'; // Necesario si usas plantillas de archivo
// import fs from 'fs/promises'; // Necesario si usas plantillas de archivo
// import Handlebars from 'handlebars'; // Ejemplo si usas Handlebars

class EmailNotificationService extends INotificationService {
    constructor(host, port, user, pass, defaultFrom, nodeEnv) { // añadir en un futuro , frontendUrl
        super();
        this.defaultFrom = defaultFrom || '"Classroom App" <no-reply@example.com>';
        // this.frontendUrl = frontendUrl; // Guardar la URL del frontend
        this.nodeEnv = nodeEnv;

        // Configura el transporter de nodemailer
        // Puedes necesitar ajustar la configuración según tu proveedor SMTP (secure, requireTLS, etc.)
        const transporterOptions = {
            host: host,
            port: parseInt(port || "587", 10), // Puerto común para TLS
            secure: parseInt(port || "587", 10) === 465, // true para 465, false para otros
            auth: {
                user: user, // Usuario SMTP
                pass: pass, // Contraseña SMTP
            },
            // Opciones adicionales si usas Gmail, etc. (less secure apps o App Passwords)

            ...(this.nodeEnv === 'development' && {
                tls: {
                    rejectUnauthorized: false // ¡Solo para desarrollo!
                }
            })
        };

        this.transporter = nodemailer.createTransport(transporterOptions);

        this.transporter.verify()
            .then(() => console.log('Email transporter is ready'))
            .catch(error => console.error('Error configuring email transporter:', error));
    }

    // // Método genérico (si lo necesitas)
    // async sendNotification(notification) {
    //     // Asume que 'notification' tiene propiedades como to, subject, body
    //     const mailOptions = {
    //         from: this.defaultFrom,
    //         to: notification.to,
    //         subject: notification.subject,
    //         html: notification.body, // O text: notification.body
    //     };

    //     try {
    //         const info = await this.transporter.sendMail(mailOptions);
    //         console.log('Email sent: %s', info.messageId);
    //         return info;
    //     } catch (error) {
    //         console.error('Error sending email:', error);
    //         throw new Error('Failed to send email notification.'); // Lanza error para que el caso de uso lo maneje
    //     }
    // }


    // // Opcional: Método para cargar plantillas
    // async loadTemplates() {
    //     try {
    //         const templateDir = path.join(__dirname, 'templates'); // Ajusta la ruta
    //         const thankYouTemplateContent = await fs.readFile(path.join(templateDir, 'reservationThankYou.hbs'), 'utf8');
    //         this.thankYouTemplate = Handlebars.compile(thankYouTemplateContent);
    //         // Carga otras plantillas...
    //     } catch (error) {
    //         console.error("Failed to load email templates:", error);
    //     }
    // }  

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
            return info;
        } catch (error) {
            console.error(`Error sending email '${subject}' to ${to}:`, error);
            // Considera si necesitas relanzar o manejar el error de forma diferente
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
        // **Mejora:** Usar una plantilla
        const body = `
            <h1>¡Registro Exitoso!</h1>
            <p>Hola ${userName || ''},</p>
            <p>Gracias por registrarte en nuestra aplicación de gestión de aulas.</p>
            <p>Ahora puedes iniciar sesión y empezar a reservar aulas.</p>
        `;
        await this._sendEmail(email, subject, body);
    }

    async sendReservationReminderEmail(email, reservationDetails) {
        const subject = 'Recordatorio de Reserva de Aula';
        // **Mejora:** Usar una plantilla
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