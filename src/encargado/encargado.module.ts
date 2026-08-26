import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Encargado } from './entities/encargado.entity';
import { EncargadoService } from './encargado.service';
import { EncargadoController } from './encargado.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Encargado,
    ]),
  ],

  controllers: [
    EncargadoController,
  ],

  providers: [
    EncargadoService,
  ],

  exports: [
    EncargadoService,
    TypeOrmModule,
  ],
})
export class EncargadoModule {}