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
  ApiTags,
} from '@nestjs/swagger';

import type {
  Request,
} from 'express';

import {
  DeclaracionService,
} from './declaracion.service';

import {
  CreateDeclaracionDto,
} from './dto/create-declaracion.dto';

import {
  UpdateDeclaracionDto,
} from './dto/update-declaracion.dto';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import type {
  UsuarioAuditoria,
} from '../auditoria/interfaces/usuario-auditoria.interface';

@ApiTags('Declaraciones')
@Controller('declaraciones')
export class DeclaracionController {
  constructor(
    private readonly declaracionService:
      DeclaracionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body()
    createDeclaracionDto:
      CreateDeclaracionDto,

    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.declaracionService.create(
      createDeclaracionDto,
      request.user,
    );
  }

  @Get()
  findAll() {
    return this.declaracionService.findAll();
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.declaracionService.findOne(
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
    updateDeclaracionDto:
      UpdateDeclaracionDto,

    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.declaracionService.update(
      id,
      updateDeclaracionDto,
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
    return this.declaracionService.remove(
      id,
      request.user,
    );
  }
}
