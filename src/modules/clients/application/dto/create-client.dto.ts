/**
 * CAPA DE APLICACIÓN - DTO (Data Transfer Object)
 * * ¿Por qué usamos un DTO y no la Entidad directamente?
 * 1. Seguridad: Evitamos que el usuario envíe campos que no debe (como el ID o el Status).
 * 2. Validación: Aquí podemos usar decoradores (como @IsEmail) para validar el Request.
 * 3. Desacoplamiento: Si el JSON externo cambia, solo modificamos este archivo, no el negocio.
 */
import {
  IsString,
  IsEmail,
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
  Length,
  Matches,
} from 'class-validator';

export class CreateClientDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  readonly name: string;

  @IsEmail({}, { message: 'El formato del correo electrónico es inválido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  readonly email: string;

  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUT es requerido' })
  @Length(8, 10, { message: 'El RUT debe tener entre 8 y 10 caracteres' })
  @Matches(/^[0-9]+[-]?[0-9kK]{1}$/, {
    message: 'El formato del RUT es inválido (ejemplo: 12345678-9)',
  })
  readonly rut: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @Length(8, 15, { message: 'El teléfono debe tener entre 8 y 15 caracteres' })
  readonly phone: string;

  @IsNumber({}, { message: 'La edad debe ser un número' })
  @IsNotEmpty({ message: 'La edad es requerida' })
  @Min(0, { message: 'La edad no puede ser negativa' })
  readonly age: number;

  @IsString({ message: 'La región debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La región es requerida' })
  @Length(2, 50, { message: 'La región debe tener entre 2 y 50 caracteres' })
  readonly region: string;

  @IsString({ message: 'La comuna debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La comuna es requerida' })
  @Length(2, 50, { message: 'La comuna debe tener entre 2 y 50 caracteres' })
  readonly commune: string;

  @IsNumber({}, { message: 'El ingreso debe ser un número' })
  @IsNotEmpty({ message: 'El ingreso es requerido' })
  @Min(0, { message: 'El ingreso no puede ser negativo' })
  readonly income: number;

  @IsNumber({}, { message: 'El número de dependientes debe ser un número' })
  @IsNotEmpty({ message: 'El número de dependientes es requerido' })
  @Min(0, { message: 'El número de dependientes no puede ser negativo' })
  @Max(20, { message: 'El número de dependientes no puede ser mayor a 20' })
  readonly dependents: number;

  @IsString({ message: 'La previsión de salud debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La previsión de salud es requerida' })
  @Length(2, 50, {
    message: 'La previsión de salud debe tener entre 2 y 50 caracteres',
  })
  readonly healthInsurance: string;

  // Nota: No incluimos 'id', 'status' ni 'createdAt' porque
  // esos valores los genera el sistema, no los envía el usuario.
}