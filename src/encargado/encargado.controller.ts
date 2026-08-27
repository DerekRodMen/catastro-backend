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
  ) {
    return this.encargadoService.create(
      createEncargadoDto,
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
  ) {
    return this.encargadoService.update(
      id,
      updateEncargadoDto,
    );
  }

  @Delete(':id')
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.encargadoService.remove(
      id,
    );
  }
}