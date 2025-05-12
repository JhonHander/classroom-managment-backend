export class LoginUserDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
  }

  validate() {
    const errors = [];

    // Email validation
    if (!this.email || this.email.trim() === '') {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        errors.push('Invalid email format');
      }
    }

    // Password validation - just check if it exists
    if (!this.password) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toData() {
    return {
      email: this.email.trim().toLowerCase(),
      password: this.password
    };
  }
}