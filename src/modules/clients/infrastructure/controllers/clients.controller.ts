import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { RegisterClientUseCase } from '../../application/use-cases/register-client.use-case';

@Controller('clients')
export class ClientsController {
  constructor(private readonly registerUseCase: RegisterClientUseCase) {}

  @Post()
  async create(@Body() body: any) {
    try {
      // Pasamos todo el objeto body al caso de uso
      return await this.registerUseCase.execute(body);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}