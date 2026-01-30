import { Dependent } from "./dependent.entity";
/**
 * Entidad de Dominio: Cliente
 * * En OOP y Arquitectura Hexagonal, la entidad no es solo un contenedor de datos (Anemic Model),
 * sino que debe contener la lógica y reglas de validación del negocio.
 */
export class Client {
    private _status: 'PENDIENTE' | 'ACTIVO';
    private _dependentList: Dependent[] = [];
    public readonly createdAt: Date;

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly email: string,
        public readonly rut: string,
        public readonly phone: string,
        public readonly age: number,
        public readonly region: string,
        public readonly commune: string,
        public readonly income: number,
        public readonly dependents: number,
        public readonly healthInsurance: string,
        createdAt: Date = new Date(),
        status: 'PENDIENTE' | 'ACTIVO' = 'PENDIENTE',
        dependentList: Dependent[] = [], //opcional
    ) {
        this.createdAt = createdAt || new Date();
        this._status = status;
        this._dependentList = dependentList;
        this.validate();
    }

    /**
     * Encapsulamiento: Validamos los datos antes de permitir la creación del objeto.
     * Si las reglas fallan, el objeto ni siquiera llega a existir en memoria.
     */
    private validate() {
        if (!this.email.includes('@')) {
            throw new Error('El formato del correo electrónico es inválido');
        }

        // Validación simple de RUT (mínimo 8 caracteres para el formato chileno)
        if (this.rut.length < 8) {
            throw new Error('El RUT debe tener al menos 8 caracteres');
        }

        // La renta no puede ser negativa para el cálculo de planes
        if (this.income < 0) {
            throw new Error('La renta declarada no puede ser un valor negativo');
        }

        // La fecha de creación no puede estar en el futuro
        if (this.createdAt > new Date()) {
            throw new Error('La fecha de registro no puede ser una fecha futura');
        }

        // El número de cargas no puede ser negativo
        if (this.dependents < 0) {
            throw new Error('El número de cargas familiares no puede ser negativo');
        }
    }

    // Getter para proteger el estado interno
    get status() {
        return this._status;
    }

    /**
     * Getter para acceder a las cargas de forma segura.
     */
    get dependentList() { return [...this._dependentList]; }

    /**
     * Método para agregar una carga validando reglas de negocio.
     */
    addDependent(dependent: Dependent) {
      if (this._dependentList.length >= 20) {
        throw new Error('No se pueden agregar más de 20 cargas familiares');
      }
      this._dependentList.push(dependent);
    }    
    /**
     * Comportamiento de Negocio: Activar cliente
     * En lugar de cambiar el status desde afuera, la entidad "sabe" cómo activarse.
     */
    activate() {
        if (this.income <= 0) {
            throw new Error('No se puede activar un cliente con renta cero o no declarada');
        }
        this._status = 'ACTIVO';
    }
}