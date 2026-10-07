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
  EncargadoService,
} from './encargado.service';

import {
  CreateEncargadoDto,
} from './dto/create-encargado.dto';

import {
  UpdateEncargadoDto,
} from './dto/update-encargado.dto';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import type {
  UsuarioAuditoria,
} from '../auditoria/interfaces/usuario-auditoria.interface';

@Controller('encargados')
@UseGuards(JwtAuthGuard)
export class EncargadoController {
  constructor(
    private readonly encargadoService:
      EncargadoService,
  ) {}

  @Post()
  create(
    @Body()
    createEncargadoDto:
      CreateEncargadoDto,

    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.encargadoService.create(
      createEncargadoDto,
      request.user,
    );
  }

  @Get()
  findAll() {
    return this.encargadoService.findAll();
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.encargadoService.findOne(
      id,
    );
  }

  @Patch(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateEncargadoDto:
      UpdateEncargadoDto,

    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.encargadoService.update(
      id,
      updateEncargadoDto,
      request.user,
    );
  }

  @Delete(':id')
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
    return this.encargadoService.remove(
      id,
      request.user,
    );
  }
}
