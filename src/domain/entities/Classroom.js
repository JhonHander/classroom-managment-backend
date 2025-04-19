class Classroom {
    // Atributos de la clase Classroom
    constructor({ id, classroom_type_id, block, classroom_number, qr_code, capacity }) {
        this.id = id;
        this.classroom_type_id = classroom_type_id; // type of the classroom (1: laboratory, 2: classroom, 3: auditorium)
        this.block = block; // block of the classroom (e.g., 7, 8, 9)
        this.classroom_number = classroom_number; // classroom number (e.g., 101, 102, 103)
        this.qr_code = qr_code; // QR code for the classroom
        this.capacity = capacity; // capacity of the classroom (e.g., 30, 40, 50)
    }

    get classroom_full_name() {
        return `${this.block}-${this.classroom_number}`;
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