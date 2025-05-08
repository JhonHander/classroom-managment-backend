/**
 * Data Transfer Object for creating a new reservation
 * Validates and transforms input data for the CreateReservationUseCase
 */
class CreateReservationDTO {
  /**
   * Validates and transforms the input data
   * @param {Object} data - The data to validate
   * @returns {Object} - The validated and transformed data
   * @throws {Error} - If validation fails
   */
  static validate(data) {
    const { userId, classroomId, date, startHour, finishHour } = data;

    // Required fields validation
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!classroomId) {
      throw new Error('Classroom ID is required');
    }

    if (!date) {
      throw new Error('Date is required');
    }

    if (!startHour) {
      throw new Error('Start hour is required');
    }

    if (!finishHour) {
      throw new Error('Finish hour is required');
    }

    // Type validation
    if (isNaN(parseInt(userId))) {
      throw new Error('User ID must be a number');
    }

    if (isNaN(parseInt(classroomId))) {
      throw new Error('Classroom ID must be a number');
    }

    // Date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }

    // Time format validation
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startHour)) {
      throw new Error('Start hour must be in HH:MM format');
    }

    if (!timeRegex.test(finishHour)) {
      throw new Error('Finish hour must be in HH:MM format');
    }

    // Time sequence validation
    if (startHour >= finishHour) {
      throw new Error('Start hour must be before finish hour');
    }

    // Ensure date is not in the past
    const reservationDate = new Date(date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (reservationDate < currentDate) {
      throw new Error('Reservation date cannot be in the past');
    }

    // Return validated and transformed data
    return {
      userId: parseInt(userId),
      classroomId: parseInt(classroomId),
      date,
      startHour,
      finishHour,
    };
  }
}

export default CreateReservationDTO;
