import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import {
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import {
  AuditoriaService,
} from './auditoria.service';


@ApiTags('Auditoría')
@Controller('auditoria')
export class AuditoriaController {

  constructor(
    private readonly auditoriaService:
      AuditoriaService,
  ) {}


  // ============================================
  // LISTAR AUDITORÍAS
  // ============================================

  @Get()

  @ApiQuery({
    name: 'usuario',
    required: false,
    type: String,
    description:
      'Filtrar por nombre o correo del usuario.',
  })

  @ApiQuery({
    name: 'modulo',
    required: false,
    type: String,
    description:
      'Filtrar por módulo, por ejemplo PARQUES.',
  })

  @ApiQuery({
    name: 'accion',
    required: false,
    type: String,
    description:
      'Filtrar por acción, por ejemplo CREAR, EDITAR o ELIMINAR.',
  })

  @ApiQuery({
    name: 'fecha_desde',
    required: false,
    type: String,
    description:
      'Fecha inicial en formato YYYY-MM-DD.',
  })

  @ApiQuery({
    name: 'fecha_hasta',
    required: false,
    type: String,
    description:
      'Fecha final en formato YYYY-MM-DD.',
  })

  findAll(
    @Query('usuario')
    usuario?: string,

    @Query('modulo')
    modulo?: string,

    @Query('accion')
    accion?: string,

    @Query('fecha_desde')
    fechaDesde?: string,

    @Query('fecha_hasta')
    fechaHasta?: string,
  ) {

    return this.auditoriaService.findAll({
      usuario,
      modulo,
      accion,

      fecha_desde:
        fechaDesde,

      fecha_hasta:
        fechaHasta,
    });
  }


  // ============================================
  // CONSULTAR AUDITORÍA POR ID
  // ============================================

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.auditoriaService.findOne(
      id,
    );
  }
}