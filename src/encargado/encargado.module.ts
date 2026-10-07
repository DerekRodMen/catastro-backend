import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EncargadoController } from './encargado.controller';
import { EncargadoService } from './encargado.service';
import { Encargado } from './entities/encargado.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Encargado,
    ]),
    AuditoriaModule,
  ],
  controllers: [
    EncargadoController,
  ],
  providers: [
    EncargadoService,
  ],
  exports: [
    EncargadoService,
  ],
})
export class EncargadoModule {}
