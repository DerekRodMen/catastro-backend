import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Parque,
} from '../parque/entities/parque.entity';

import {
  Mantenimiento,
} from './entities/mantenimiento.entity';

import {
  MantenimientoImagen,
} from './entities/mantenimiento-imagen.entity';

import {
  MantenimientoController,
} from './mantenimiento.controller';

import {
  MantenimientoService,
} from './mantenimiento.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Mantenimiento,
      MantenimientoImagen,
      Parque,
    ]),
  ],

  controllers: [
    MantenimientoController,
  ],

  providers: [
    MantenimientoService,
  ],

  exports: [
    MantenimientoService,
  ],
})
export class MantenimientoModule {}