class User {
  constructor({ id, rol_id, name, last_name, email, password }) {
    this.id = id; // ID of the user
    this.rol_id = rol_id; // type of user (1: admin, 2: teacher, 3: student)
    this.name = name;
    this.last_name = last_name;
    this.email = email;
    this.password = password; // Password should be hashed in the database
  }

  // Campo calculado (getter)
  get full_name() {
    return `${this.name} ${this.last_name}`;
  }

  hasRightsJerarchy() {
    return this.rol === 'admin' || this.rol === 'teacher';
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