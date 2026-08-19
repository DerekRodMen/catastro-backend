import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvenioController } from './convenio.controller';
import { ConvenioService } from './convenio.service';

import { Convenio } from './entities/convenio.entity';
import { Parque } from '../parque/entities/parque.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Convenio,
      Parque,
    ]),
  ],

  controllers: [
    ConvenioController,
  ],

  providers: [
    ConvenioService,
  ],

  exports: [
    ConvenioService,
  ],
})
export class ConvenioModule {}