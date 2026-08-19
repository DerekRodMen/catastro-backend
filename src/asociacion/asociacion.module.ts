import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AsociacionController } from './asociacion.controller';
import { AsociacionService } from './asociacion.service';
import { Asociacion } from './entities/asociacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asociacion]),
  ],
  controllers: [AsociacionController],
  providers: [AsociacionService],
  exports: [AsociacionService],
})
export class AsociacionModule {}