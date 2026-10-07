import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entities/usuario.entity';
import { MailService } from '../mail/mail.service';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
    ]),
    AuditoriaModule,
  ],
  controllers: [
    UsuarioController,
  ],
  providers: [
    UsuarioService,
    MailService,
  ],
  exports: [
    UsuarioService,
  ],
})
export class UsuarioModule {}
