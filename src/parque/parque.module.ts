import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ParqueController } from './parque.controller';
import { ParqueService } from './parque.service';
import { Parque } from './entities/parque.entity';

import { Distrito } from '../distrito/entities/distrito.entity';
import { Asociacion } from '../asociacion/entities/asociacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Parque,
      Distrito,
      Asociacion,
    ]),
  ],

  controllers: [
    ParqueController,
  ],

  providers: [
    ParqueService,
  ],

  exports: [
    ParqueService,
  ],
})
export class ParqueModule {}