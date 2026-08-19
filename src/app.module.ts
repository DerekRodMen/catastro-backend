import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DistritoModule } from './distrito/distrito.module';
import { AsociacionModule } from './asociacion/asociacion.module';
import { ParqueModule } from './parque/parque.module';
import { ConvenioModule } from './convenio/convenio.module';
import { DeclaracionModule } from './declaracion/declaracion.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';

import { Distrito } from './distrito/entities/distrito.entity';
import { Asociacion } from './asociacion/entities/asociacion.entity';
import { Parque } from './parque/entities/parque.entity';
import { Convenio } from './convenio/entities/convenio.entity';
import { Declaracion } from './declaracion/entities/declaracion.entity';
import { Usuario } from './usuario/entities/usuario.entity';

import * as mssql from 'mssql/msnodesqlv8';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mssql',

      driver: mssql,

      database: 'Catastro',

      entities: [
        Distrito,
        Asociacion,
        Parque,
        Convenio,
        Declaracion,
        Usuario,
      ],

      synchronize: false,

      extra: {
        connectionString:
          'DSN=CatastroDB;Trusted_Connection=Yes;',
      },
    }),

    DistritoModule,
    AsociacionModule,
    ParqueModule,
    ConvenioModule,
    DeclaracionModule,
    UsuarioModule,
    AuthModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}