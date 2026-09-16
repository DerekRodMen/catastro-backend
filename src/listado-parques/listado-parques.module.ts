import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  ListadoParquesController,
} from './listado-parques.controller';

import {
  ListadoParquesService,
} from './listado-parques.service';

import {
  Parque,
} from '../parque/entities/parque.entity';

import {
  Mantenimiento,
} from '../mantenimiento/entities/mantenimiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Parque,
      Mantenimiento,
    ]),
  ],

  controllers: [
    ListadoParquesController,
  ],

  providers: [
    ListadoParquesService,
  ],
})
export class ListadoParquesModule {}