import {
  Module,
} from '@nestjs/common';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';


// ============================================
// MÓDULOS
// ============================================

import {
  AuthModule,
} from './auth/auth.module';

import {
  UsuarioModule,
} from './usuario/usuario.module';

import {
  DistritoModule,
} from './distrito/distrito.module';

import {
  EncargadoModule,
} from './encargado/encargado.module';

import {
  ParqueModule,
} from './parque/parque.module';

import {
  ConvenioModule,
} from './convenio/convenio.module';

import {
  DeclaracionModule,
} from './declaracion/declaracion.module';

import {
  MailModule,
} from './mail/mail.module';


// ============================================
// ENTIDADES
// ============================================

import {
  Usuario,
} from './usuario/entities/usuario.entity';

import {
  Distrito,
} from './distrito/entities/distrito.entity';

import {
  Encargado,
} from './encargado/entities/encargado.entity';

import {
  Parque,
} from './parque/entities/parque.entity';

import {
  Convenio,
} from './convenio/entities/convenio.entity';

import {
  Declaracion,
} from './declaracion/entities/declaracion.entity';


@Module({
  imports: [

    // ============================================
    // VARIABLES DE ENTORNO
    // ============================================

    ConfigModule.forRoot({
      isGlobal: true,
    }),


    // ============================================
    // SQL SERVER
    // ============================================

    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService:
          ConfigService,
      ) => ({
        type: 'mssql',

        host:
          configService.get<string>(
            'DB_HOST',
          ),

        port:
          Number(
            configService.get<string>(
              'DB_PORT',
            ),
          ),

        username:
          configService.get<string>(
            'DB_USERNAME',
          ),

        password:
          configService.get<string>(
            'DB_PASSWORD',
          ),

        database:
          configService.get<string>(
            'DB_DATABASE',
          ),

        entities: [
          Usuario,
          Distrito,
          Encargado,
          Parque,
          Convenio,
          Declaracion,
        ],

        synchronize: false,

        options: {
          encrypt: true,

          trustServerCertificate:
            true,
        },
      }),
    }),


    // ============================================
    // AUTENTICACIÓN
    // ============================================

    AuthModule,


    // ============================================
    // USUARIOS
    // ============================================

    UsuarioModule,


    // ============================================
    // DISTRITOS
    // ============================================

    DistritoModule,


    // ============================================
    // ENCARGADOS
    // ============================================

    EncargadoModule,


    // ============================================
    // PARQUES
    // ============================================

    ParqueModule,


    // ============================================
    // CONVENIOS
    // ============================================

    ConvenioModule,


    // ============================================
    // DECLARACIONES
    // ============================================

    DeclaracionModule,


    // ============================================
    // CORREO
    // ============================================

    MailModule,
  ],
})
export class AppModule {}