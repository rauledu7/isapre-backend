/**
 * CAPA DE APLICACIÓN - DTO (Data Transfer Object)
 * * ¿Por qué usamos un DTO y no la Entidad directamente?
 * 1. Seguridad: Evitamos que el usuario envíe campos que no debe (como el ID o el Status).
 * 2. Validación: Aquí podemos usar decoradores (como @IsEmail) para validar el Request.
 * 3. Desacoplamiento: Si el JSON externo cambia, solo modificamos este archivo, no el negocio.
 */
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateDependentDto {
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUT es requerido' })
  @Length(8, 10, { message: 'El RUT debe tener entre 8 y 10 caracteres' })
  @Matches(/^[0-9]+[-]?[0-9kK]{1}$/, {
    message: 'El formato del RUT es inválido (ejemplo: 12345678-9)',
  })
  readonly rut: string;

  @IsNumber({}, { message: 'La edad debe ser un número' })
  @IsNotEmpty({ message: 'La edad es requerida' })
  @Min(0, { message: 'La edad no puede ser negativa' })
  readonly age: number;
  // Nota: No incluimos 'id', 'status' ni 'createdAt' porque
  // esos valores los genera el sistema, no los envía el usuario.
}