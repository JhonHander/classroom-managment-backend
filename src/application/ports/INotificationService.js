class INotificationService {

    // async sendPushNotification(userId, title, body, message) {
    //     throw new Error('Method not implemented');
    // }

    async sendReservationThankYouEmail(email, reservationDetails) {
        throw new Error('Method not implemented');
    }

    // async sendPasswordResetEmail(email, token) {
    //     throw new Error('Method not implemented');
    // }

    async sendRegistrationThankYouEmail(email, userName) {
        throw new Error('Method not implemented');
    }

    async sendReservationReminderEmail(email, reservationDetails) {
        throw new Error('Method not implemented');
    }

}
// This interface defines the contract for a notification service.
// It includes a method for sending notifications.

export default INotificationService;