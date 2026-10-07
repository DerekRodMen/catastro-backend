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

import {
  ApiBearerAuth,
} from '@nestjs/swagger';

import type {
  Request,
} from 'express';

import {
  DistritoService,
} from './distrito.service';

import {
  CreateDistritoDto,
} from './dto/create-distrito.dto';

import {
  UpdateDistritoDto,
} from './dto/update-distrito.dto';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import type {
  UsuarioAuditoria,
} from '../auditoria/interfaces/usuario-auditoria.interface';

@ApiBearerAuth('access-token')
@Controller('distritos')
export class DistritoController {
  constructor(
    private readonly distritoService:
      DistritoService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body()
    createDistritoDto:
      CreateDistritoDto,

    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.distritoService.create(
      createDistritoDto,
      request.user,
    );
  }

  @Get()
  findAll() {
    return this.distritoService.findAll();
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.distritoService.findOne(
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
    updateDistritoDto:
      UpdateDistritoDto,

    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.distritoService.update(
      id,
      updateDistritoDto,
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
    return this.distritoService.remove(
      id,
      request.user,
    );
  }
}
