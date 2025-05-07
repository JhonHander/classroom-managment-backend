class Classroom {
    // Atributos de la clase Classroom
    constructor({ id, classroomType, block, classroomNumber, classroomFullName, capacity }) {
        this.id = id;
        this.type = classroomType; // type of the classroom (1: laboratory, 2: classroom, 3: auditorium)
        this.block = block; // block of the classroom (e.g., 7, 8, 9)
        this.number = classroomNumber; // classroom number (e.g., 101, 102, 103)
        // Si el nombre completo viene de la base de datos, lo usamos
        this._fullName = classroomFullName;
        this.capacity = capacity; // capacity of the classroom (e.g., 30, 40, 50)
    }

    // Getter para obtener el nombre completo
    // Si ya tenemos el nombre de la base de datos, lo usamos,
    // de lo contrario lo generamos con block y number
    get fullName() {
        return this._fullName || `${this.block}-${this.number}`;
    }

    // Usamos el fullName como código único para los QR
    get uniqueCode() {
        return this.fullName;
    }

    agregarCaracteristica(caracteristica) {
        if (!this.tieneCaracteristica(caracteristica.nombre)) {
            this.caracteristicas.push(caracteristica);
        }
    }

    tieneCaracteristica(caracteristicaId) {
        return this.caracteristicas.some(c => c.id === caracteristicaId);
    }
}

export default Classroom;