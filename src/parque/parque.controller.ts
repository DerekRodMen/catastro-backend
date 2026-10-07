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
  Request,
} from 'express';

import {
  ParqueService,
} from './parque.service';

import {
  CreateParqueDto,
} from './dto/create-parque.dto';

import {
  UpdateParqueDto,
} from './dto/update-parque.dto';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';


// ============================================
// USUARIO AUTENTICADO
// ============================================

interface UsuarioAutenticado {
  id_usuario: number;
  correo: string;
  nombre_usuario: string | null;
}


interface RequestAutenticado extends Request {
  user: UsuarioAutenticado;
}


@Controller('parques')
export class ParqueController {

  constructor(
    private readonly parqueService:
      ParqueService,
  ) {}


  // ============================================
  // CREAR PARQUE
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body()
    createParqueDto:
      CreateParqueDto,

    @Req()
    request:
      RequestAutenticado,
  ) {
    return this.parqueService.create(
      createParqueDto,
      request.user,
    );
  }


  // ============================================
  // LISTAR PARQUES
  // ============================================

  @Get()
  findAll() {
    return this.parqueService.findAll();
  }


  // ============================================
  // BUSCAR PARQUE
  // ============================================

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.parqueService.findOne(
      id,
    );
  }


  // ============================================
  // ACTUALIZAR PARQUE
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
    updateParqueDto:
      UpdateParqueDto,

    @Req()
    request:
      RequestAutenticado,
  ) {
    return this.parqueService.update(
      id,
      updateParqueDto,
      request.user,
    );
  }


  // ============================================
  // ELIMINAR PARQUE
  // ============================================

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
      RequestAutenticado,
  ) {
    return this.parqueService.remove(
      id,
      request.user,
    );
  }
}