import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

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

@Controller('usuarios')
export class UsuarioController {
  constructor(
    private readonly usuarioService:
      UsuarioService,
  ) {}

  // ============================================
  // ACTIVAR CUENTA
  // PÚBLICO
  // ============================================

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

  // ============================================
  // SOLICITAR RECUPERACIÓN
  // PÚBLICO
  // ============================================

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

  // ============================================
  // RESTABLECER CONTRASEÑA
  // PÚBLICO
  // ============================================

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

  // ============================================
  // INVITAR USUARIO
  // PROTEGIDO
  // ============================================

  @Post('invitar')
  @UseGuards(JwtAuthGuard)
  invitar(
    @Body()
    invitarUsuarioDto:
      InvitarUsuarioDto,
  ) {
    return this.usuarioService.invitar(
      invitarUsuarioDto,
    );
  }

  // ============================================
  // SOLICITAR CAMBIO DE CORREO
  // PROTEGIDO
  // ============================================

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
  ) {
    return this.usuarioService.solicitarCambioCorreo(
      id,
      dto,
    );
  }

  // ============================================
  // VERIFICAR CAMBIO DE CORREO
  // PROTEGIDO
  // ============================================

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
  ) {
    return this.usuarioService.verificarCambioCorreo(
      id,
      dto,
    );
  }

  // ============================================
  // REENVIAR CÓDIGO
  // PROTEGIDO
  // ============================================

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

  // ============================================
  // LISTAR
  // ============================================

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usuarioService.findAll();
  }

  // ============================================
  // BUSCAR
  // ============================================

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

  // ============================================
  // EDITAR
  // ============================================

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
  ) {
    return this.usuarioService.update(
      id,
      updateUsuarioDto,
    );
  }

  // ============================================
  // ELIMINAR
  // ============================================

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.usuarioService.remove(
      id,
    );
  }
}
