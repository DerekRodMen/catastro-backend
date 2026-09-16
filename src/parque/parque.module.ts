import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Parque,
} from './entities/parque.entity';

import {
  Distrito,
} from '../distrito/entities/distrito.entity';

import {
  Encargado,
} from '../encargado/entities/encargado.entity';

import {
  ParqueController,
} from './parque.controller';

import {
  ParqueService,
} from './parque.service';

import {
  AuditoriaModule,
} from '../auditoria/auditoria.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Parque,
      Distrito,
      Encargado,
    ]),

    AuditoriaModule,
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