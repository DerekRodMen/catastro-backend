import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';

import {
  memoryStorage,
} from 'multer';

import type {
  Response,
} from 'express';

import {
  MantenimientoService,
} from './mantenimiento.service';

import {
  CreateMantenimientoDto,
} from './dto/create-mantenimiento.dto';

import {
  UpdateMantenimientoDto,
} from './dto/update-mantenimiento.dto';


const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const MAX_IMAGENES_POR_TIPO =
  20;


const configuracionArchivos = {

  storage:
    memoryStorage(),

  limits: {
    fileSize:
      MAX_FILE_SIZE,

    files:
      MAX_IMAGENES_POR_TIPO * 2,
  },

  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    callback: (
      error: Error | null,
      acceptFile: boolean,
    ) => void,
  ) => {

    const permitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];


    if (
      !permitidos.includes(
        file.mimetype,
      )
    ) {

      return callback(
        new BadRequestException(
          'Solo se permiten imágenes JPG, JPEG, PNG o WEBP.',
        ),
        false,
      );
    }


    callback(
      null,
      true,
    );
  },
};


@Controller('mantenimientos')
export class MantenimientoController {

  constructor(
    private readonly mantenimientoService:
      MantenimientoService,
  ) {}


  // =====================================================
  // CREAR
  // =====================================================

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name:
            'imagenes_antes',

          maxCount:
            MAX_IMAGENES_POR_TIPO,
        },

        {
          name:
            'imagenes_despues',

          maxCount:
            MAX_IMAGENES_POR_TIPO,
        },
      ],
      configuracionArchivos,
    ),
  )
  create(
    @Body()
    dto: CreateMantenimientoDto,

    @UploadedFiles()
    archivos?: {
      imagenes_antes?:
        Express.Multer.File[];

      imagenes_despues?:
        Express.Multer.File[];
    },
  ) {

    return this.mantenimientoService.create(

      dto,

      archivos
        ?.imagenes_antes ||
        [],

      archivos
        ?.imagenes_despues ||
        [],
    );
  }


  // =====================================================
  // LISTAR
  // =====================================================

  @Get()
  findAll() {

    return this.mantenimientoService.findAll();
  }


  // =====================================================
  // CANTIDAD POR PARQUE
  // =====================================================

  @Get(
    'parque/:idParque/cantidad',
  )
  obtenerCantidad(
    @Param(
      'idParque',
      ParseIntPipe,
    )
    idParque: number,
  ) {

    return this.mantenimientoService
      .obtenerCantidadPorParque(
        idParque,
      );
  }


  // =====================================================
  // IMAGEN
  // =====================================================

  @Get(
    ':id/imagenes/:idImagen',
  )
  async obtenerImagen(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Param(
      'idImagen',
      ParseIntPipe,
    )
    idImagen: number,

    @Res()
    response: Response,

  ) {

    const imagen =
      await this.mantenimientoService
        .obtenerImagen(
          id,
          idImagen,
        );


    response.setHeader(
      'Content-Type',
      imagen.contentType,
    );


    response.setHeader(
      'Cache-Control',
      'private, max-age=300',
    );


    response.send(
      imagen.buffer,
    );
  }


  // =====================================================
  // ELIMINAR UNA IMAGEN
  // =====================================================

  @Delete(
    ':id/imagenes/:idImagen',
  )
  eliminarImagen(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Param(
      'idImagen',
      ParseIntPipe,
    )
    idImagen: number,

  ) {

    return this.mantenimientoService
      .eliminarImagen(
        id,
        idImagen,
      );
  }


  // =====================================================
  // BUSCAR UNO
  // =====================================================

  @Get(':id')
  findOne(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

  ) {

    return this.mantenimientoService.findOne(
      id,
    );
  }


  // =====================================================
  // ACTUALIZAR
  // =====================================================

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name:
            'imagenes_antes',

          maxCount:
            MAX_IMAGENES_POR_TIPO,
        },

        {
          name:
            'imagenes_despues',

          maxCount:
            MAX_IMAGENES_POR_TIPO,
        },
      ],
      configuracionArchivos,
    ),
  )
  update(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateMantenimientoDto,

    @UploadedFiles()
    archivos?: {
      imagenes_antes?:
        Express.Multer.File[];

      imagenes_despues?:
        Express.Multer.File[];
    },

  ) {

    return this.mantenimientoService.update(

      id,

      dto,

      archivos
        ?.imagenes_antes ||
        [],

      archivos
        ?.imagenes_despues ||
        [],
    );
  }


  // =====================================================
  // ELIMINAR
  // =====================================================

  @Delete(':id')
  remove(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

  ) {

    return this.mantenimientoService.remove(
      id,
    );
  }
}