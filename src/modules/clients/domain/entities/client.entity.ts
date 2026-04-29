import { Dependent } from "./dependent.entity";

/**
 * ENTIDAD DE DOMINIO: CLIENTE
 * * En esta versión, el conteo de cargas es automático y basado en la realidad 
 * de la lista, eliminando inconsistencias entre el número y los objetos.
 */
export class Client {
    private _status: 'PENDIENTE' | 'ACTIVO';
    private _dependents: Dependent[] = [];
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
        public readonly healthInsurance: string, // Eliminamos 'dependents: number' del constructor
        createdAt?: Date,
        status: 'PENDIENTE' | 'ACTIVO' = 'PENDIENTE',
        dependents: Dependent[] = [], 
    ) {
        this.createdAt = createdAt || new Date();
        this._status = status;
        this._dependents = dependents;
        this.validate();
    }

    /**
     * 🔢 PROPIEDAD CALCULADA (Getter)
     * Reemplaza al antiguo campo 'dependents'. 
     * Siempre devuelve la cantidad real de objetos en la lista.
     */
    get dependentsCount(): number {
        return this._dependents.length;
    }

    /**
     * Getter para acceder a las cargas de forma segura (Inmutabilidad).
     */
    get dependents(): Dependent[] {
        return [...this._dependents];
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

        if (this.createdAt > new Date()) {
            throw new Error('La fecha de registro no puede ser una fecha futura');
        }
        
        // Validamos el límite inicial si se pasan cargas por constructor
        if (this._dependents.length > 20) {
            throw new Error('No se pueden registrar más de 20 cargas familiares');
        }
    }

    /**
     * REGLA DE NEGOCIO: Agregar una carga dinámicamente.
     */
    addDependent(dependent: Dependent) {
      if (this._dependents.length >= 20) {
        throw new Error('No se pueden agregar más de 20 cargas familiares');
      }
      this._dependents.push(dependent);
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

    get status() {
        return this._status;
    }
}