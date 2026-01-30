/**
 * Entidad de Dominio: Dependientes
 * * En OOP y Arquitectura Hexagonal, la entidad no es solo un contenedor de datos (Anemic Model),
 * sino que debe contener la lógica y reglas de validación del negocio.
 */
export class Dependent {
    public readonly createdAt: Date;

    constructor(
        public readonly id: string,
        public readonly rut: string,
        public readonly age: number,
        createdAt?: Date,
    ) {
        this.createdAt = createdAt || new Date();
        this.validate();
    }

    /**
     * Encapsulamiento: Validamos los datos antes de permitir la creación del objeto.
     * Si las reglas fallan, el objeto ni siquiera llega a existir en memoria.
     */
    private validate() {
        // Validación simple de RUT (mínimo 8 caracteres para el formato chileno)
        if (this.rut.length < 8) {
            throw new Error('El RUT debe tener al menos 8 caracteres');
        }

        // La edad no puede ser negativa para el cálculo de planes
        if (this.age < 0) {
            throw new Error('La edad declarada no puede ser un valor negativo');
        }

        // La edad no puede ser mayor a 100 años para el cálculo de planes
        if (this.age < 100) {
            throw new Error('La edad declarada no puede ser un valor mayor a 100 años');
        }
    }
}