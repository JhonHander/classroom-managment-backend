/**
 * Data Transfer Object for creating a new reservation
 * Validates and transforms input data for the CreateReservationUseCase
 */
class CreateReservationDTO {
  /**
   * Validates the input data
   * @param {Object} data - The data to validate
   * @returns {Object} - The validated data
   * @throws {Error} - If validation fails
   */
  static validate(data) {
    const { email, classroomFullName, date, startHour, finishHour } = data;

    // Required fields validation
    if (!email) {
      throw new Error('User email is required');
    }

    if (!classroomFullName) {
      throw new Error('Classroom full name is required');
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Classroom fullName validation - formato "10-101" o "8-102"
    const classroomRegex = /^\d+-\d+$/;
    if (!classroomRegex.test(classroomFullName)) {
      throw new Error('Classroom full name must be in the format "Block-Number" (e.g., "10-101", "8-102")');
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

    return data;
  }

  /**
   * Transforms input data to domain model format
   * @param {Object} data - The validated data
   * @returns {Object} - The transformed data ready for use case
   */
  static toData(data) {
    const validatedData = this.validate(data);

    return {
      email: validatedData.email,
      classroomFullName: validatedData.classroomFullName,
      date: validatedData.date,
      startHour: validatedData.startHour,
      finishHour: validatedData.finishHour,
    };
  }
}

export default CreateReservationDTO;
