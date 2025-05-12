/**
 * Data Transfer Object for user registration
 * Validates and sanitizes user input before passing to use case
 */
export class RegisterUserDTO {
  constructor(data) {
    this.name = data.name;
    this.lastName = data.lastName || '';
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 3; // Default to student role (assuming 3 is student)
  }

  /**
   * Validates the DTO data
   * @returns {Object} Object with isValid and errors properties
   */
  validate() {
    const errors = [];

    // Name validation
    if (!this.name || this.name.trim() === '') {
      errors.push('Name is required');
    } else if (this.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    // Email validation
    if (!this.email || this.email.trim() === '') {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        errors.push('Invalid email format');
      }
    }

    // Password validation
    if (!this.password) {
      errors.push('Password is required');
    } else if (this.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    // Role validation
    if (this.role && ![1, 2, 3].includes(this.role)) {
      errors.push('Invalid role');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Returns a sanitized version of the DTO data
   * @returns {Object} Sanitized data
   */
  toData() {
    return {
      name: this.name.trim(),
      lastName: this.lastName ? this.lastName.trim() : '',
      email: this.email.trim().toLowerCase(),
      password: this.password,
      role: this.role
    };
  }
}