import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DistritoController } from './distrito.controller';
import { DistritoService } from './distrito.service';
import { Distrito } from './entities/distrito.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Distrito,
    ]),
    AuditoriaModule,
  ],
  controllers: [
    DistritoController,
  ],
  providers: [
    DistritoService,
  ],
  exports: [
    DistritoService,
  ],
})
export class DistritoModule {}
