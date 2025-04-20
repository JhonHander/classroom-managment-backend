class User {
  constructor({ id, role, name, lastName, email, password }) {
    this.id = id; // ID of the user
    this.role = role; // type of user (1: admin, 2: teacher, 3: student)
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.password = password; // Password should be hashed in the database
  }

  // Campo calculado (getter)
  get full_name() {
    return `${this.name} ${this.lastName}`;
  }

  hasRightsJerarchy() {
    return this.roleId === 1 || this.rol === 2;
  }

  whatsTheRole() {
    switch (this.rol_id) {
      case 1:
        return 'admin';
      case 2:
        return 'teacher';
      case 3:
        return 'student';
      default:
        return 'unknown';
    }
  }

}