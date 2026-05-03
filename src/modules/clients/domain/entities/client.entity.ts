/**
 * ENTIDAD DE DOMINIO: CLIENTE
 * Ajustada para manejar cantidad de cargas y edades como datos directos.
 */
export class Client {
    private _status: 'PENDIENTE' | 'ACTIVO';
    public readonly createdAt: Date;

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly email: string,
        public readonly rut: string,
        public readonly phone: string,
        public readonly age: number,
        public readonly clinics: string,
        public readonly income: number,
        public readonly healthInsurance: string,
        public readonly dependentsCount: number, // Recibido del frontend/DTO
        public readonly dependentsAges: string,  // Recibido del frontend/DTO (ej: "12,4,2")
        createdAt?: Date,
        status: 'PENDIENTE' | 'ACTIVO' = 'PENDIENTE',
    ) {
        this.createdAt = createdAt || new Date();
        this._status = status;
        this.validate();
    }

    /**
     * Encapsulamiento: Validamos los datos críticos del negocio.
     */
    private validate() {
        if (!this.email.includes('@')) {
            throw new Error('El formato del correo electrónico es inválido');
        }

        if (this.rut.length < 8) {
            throw new Error('El RUT debe tener al menos 8 caracteres');
        }

        if (this.income < 0) {
            throw new Error('La renta declarada no puede ser un valor negativo');
        }

        // Si hay cargas, la cantidad debe coincidir mínimamente con la lógica
        if (this.dependentsCount > 0 && !this.dependentsAges) {
            throw new Error('Si declara cargas, debe indicar sus edades');
        }
    }

    /**
     * Comportamiento de Negocio: Activar cliente.
     */
    activate() {
        if (this.income <= 0) {
            throw new Error('No se puede activar un cliente con renta cero o no declarada');
        }
        this._status = 'ACTIVO';
    }

    // Getters necesarios para el repositorio o eventos
    get status() {
        return this._status;
    }
}