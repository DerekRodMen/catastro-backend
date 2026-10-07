import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MantenimientoController } from './mantenimiento.controller';
import { MantenimientoService } from './mantenimiento.service';
import { Mantenimiento } from './entities/mantenimiento.entity';
import { MantenimientoImagen } from './entities/mantenimiento-imagen.entity';
import { Parque } from '../parque/entities/parque.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Mantenimiento,
      MantenimientoImagen,
      Parque,
    ]),
    AuditoriaModule,
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
