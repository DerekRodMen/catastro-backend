import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeclaracionController } from './declaracion.controller';
import { DeclaracionService } from './declaracion.service';

import { Declaracion } from './entities/declaracion.entity';
import { Parque } from '../parque/entities/parque.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Declaracion,
      Parque,
    ]),
  ],

  controllers: [
    DeclaracionController,
  ],

  providers: [
    DeclaracionService,
  ],

  exports: [
    DeclaracionService,
  ],
})
export class DeclaracionModule {}