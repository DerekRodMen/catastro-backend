import {
  Global,
  Module,
} from '@nestjs/common';

import {
  APP_INTERCEPTOR,
} from '@nestjs/core';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Auditoria,
} from './entities/auditoria.entity';

import {
  AuditoriaController,
} from './auditoria.controller';

import {
  AuditoriaService,
} from './auditoria.service';

import {
  AuditoriaCambiosInterceptor,
} from './auditoria-cambios.interceptor';


@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Auditoria,
    ]),
  ],

  controllers: [
    AuditoriaController,
  ],

  providers: [
    AuditoriaService,

    {
      provide:
        APP_INTERCEPTOR,

      useClass:
        AuditoriaCambiosInterceptor,
    },
  ],

  exports: [
    AuditoriaService,
  ],
})
export class AuditoriaModule {}
