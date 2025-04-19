class Classroom {
    // Atributos de la clase Classroom
    constructor({ id, classroomType, block, classroomNumber, classroomFullName, qrCode, capacity }) {
        this.id = id;
        this.type = classroomType; // type of the classroom (1: laboratory, 2: classroom, 3: auditorium)
        this.block = block; // block of the classroom (e.g., 7, 8, 9)
        this.fullName = classroomFullName;
        this.number = classroomNumber; // classroom number (e.g., 101, 102, 103)
        this.qrCode = qrCode; // QR code for the classroom
        this.capacity = capacity; // capacity of the classroom (e.g., 30, 40, 50)
    }

    get classroomFullName() {
        return `${this.block}-${this.classroomNumber}`;
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