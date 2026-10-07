import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type {
  Request,
} from 'express';

import {
  UsuarioService,
} from './usuario.service';

import {
  UpdateUsuarioDto,
} from './dto/update-usuario.dto';

import {
  InvitarUsuarioDto,
} from './dto/invitar-usuario.dto';

import {
  ActivarUsuarioDto,
} from './dto/activar-usuario.dto';

import {
  SolicitarRecuperacionDto,
} from './dto/solicitar-recuperacion.dto';

import {
  RestablecerPasswordDto,
} from './dto/restablecer-password.dto';

import {
  SolicitarCambioCorreoDto,
} from './dto/solicitar-cambio-correo.dto';

import {
  VerificarCambioCorreoDto,
} from './dto/verificar-cambio-correo.dto';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import type {
  UsuarioAuditoria,
} from '../auditoria/interfaces/usuario-auditoria.interface';

@Controller('usuarios')
export class UsuarioController {
  constructor(
    private readonly usuarioService:
      UsuarioService,
  ) {}

  @Post('activar')
  activarCuenta(
    @Body()
    activarUsuarioDto:
      ActivarUsuarioDto,
  ) {
    return this.usuarioService.activarCuenta(
      activarUsuarioDto,
    );
  }

  @Post('solicitar-recuperacion')
  solicitarRecuperacion(
    @Body()
    dto:
      SolicitarRecuperacionDto,
  ) {
    return this.usuarioService.solicitarRecuperacion(
      dto,
    );
  }

  @Post('restablecer-password')
  restablecerPassword(
    @Body()
    dto:
      RestablecerPasswordDto,
  ) {
    return this.usuarioService.restablecerPassword(
      dto,
    );
  }

  @Post('invitar')
  @UseGuards(JwtAuthGuard)
  invitar(
    @Body()
    invitarUsuarioDto:
      InvitarUsuarioDto,

    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.usuarioService.invitar(
      invitarUsuarioDto,
      request.user,
    );
  }

  @Post(':id/solicitar-cambio-correo')
  @UseGuards(JwtAuthGuard)
  solicitarCambioCorreo(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto:
      SolicitarCambioCorreoDto,

    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.usuarioService.solicitarCambioCorreo(
      id,
      dto,
      request.user,
    );
  }

  @Post(':id/verificar-cambio-correo')
  @UseGuards(JwtAuthGuard)
  verificarCambioCorreo(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto:
      VerificarCambioCorreoDto,

    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.usuarioService.verificarCambioCorreo(
      id,
      dto,
      request.user,
    );
  }

  @Post(':id/reenviar-codigo-correo')
  @UseGuards(JwtAuthGuard)
  reenviarCodigoCambioCorreo(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.usuarioService.reenviarCodigoCambioCorreo(
      id,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.usuarioService.findOne(
      id,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateUsuarioDto:
      UpdateUsuarioDto,

    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.usuarioService.update(
      id,
      updateUsuarioDto,
      request.user,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.usuarioService.remove(
      id,
      request.user,
    );
  }
}
