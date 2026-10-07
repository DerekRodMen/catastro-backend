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
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';

import { MantenimientoService } from './mantenimiento.service';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UsuarioAuditoria } from '../auditoria/interfaces/usuario-auditoria.interface';

// Tamaño máximo permitido por imagen: 5 MB.
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Cantidad máxima de imágenes permitidas por tipo.
const MAX_IMAGENES_POR_TIPO = 20;

// Configuración para la carga y validación de imágenes.
const configuracionArchivos = {
  storage: memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_IMAGENES_POR_TIPO * 2,
  },

  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    callback: (
      error: Error | null,
      acceptFile: boolean,
    ) => void,
  ) => {
    // Tipos de imagen permitidos.
    const permitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!permitidos.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          'Solo se permiten imágenes JPG, JPEG, PNG o WEBP.',
        ),
        false,
      );
    }

    callback(null, true);
  },
};

@Controller('mantenimientos')
export class MantenimientoController {
  constructor(
    private readonly mantenimientoService: MantenimientoService,
  ) {}

  // ================================
  // CREAR MANTENIMIENTO
  // ================================

  // Crea un nuevo mantenimiento y permite adjuntar imágenes.
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'imagenes_antes',
          maxCount: MAX_IMAGENES_POR_TIPO,
        },
        {
          name: 'imagenes_despues',
          maxCount: MAX_IMAGENES_POR_TIPO,
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
      imagenes_antes?: Express.Multer.File[];
      imagenes_despues?: Express.Multer.File[];
    },

    @Req()
    request?: Request & {
      user: UsuarioAuditoria;
    },
  ) {
    return this.mantenimientoService.create(
      dto,
      archivos?.imagenes_antes || [],
      archivos?.imagenes_despues || [],
      request!.user,
    );
  }

  // ================================
  // LISTAR MANTENIMIENTOS
  // ================================

  // Obtiene todos los mantenimientos registrados.
  @Get()
  findAll() {
    return this.mantenimientoService.findAll();
  }

  // ================================
  // CANTIDAD POR PARQUE
  // ================================

  // Obtiene la cantidad de mantenimientos asociados a un parque.
  @Get('parque/:idParque/cantidad')
  obtenerCantidad(
    @Param(
      'idParque',
      ParseIntPipe,
    )
    idParque: number,
  ) {
    return this.mantenimientoService.obtenerCantidadPorParque(
      idParque,
    );
  }

  // ================================
  // OBTENER IMAGEN
  // ================================

  // Devuelve una imagen específica de un mantenimiento.
  @Get(':id/imagenes/:idImagen')
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
      await this.mantenimientoService.obtenerImagen(
        id,
        idImagen,
      );

    response.setHeader(
      'Content-Type',
      imagen.contentType,
    );

    // Permite almacenar la imagen en caché durante 5 minutos.
    response.setHeader(
      'Cache-Control',
      'private, max-age=300',
    );

    response.send(imagen.buffer);
  }

  // ================================
  // ELIMINAR IMAGEN
  // ================================

  // Elimina una imagen específica de un mantenimiento.
  @Delete(':id/imagenes/:idImagen')
  @UseGuards(JwtAuthGuard)
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

    @Req()
    request: Request & {
      user: UsuarioAuditoria;
    },
  ) {
    return this.mantenimientoService.eliminarImagen(
      id,
      idImagen,
      request.user,
    );
  }

  // ================================
  // BUSCAR MANTENIMIENTO
  // ================================

  // Obtiene un mantenimiento específico por su ID.
  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.mantenimientoService.findOne(id);
  }

  // ================================
  // ACTUALIZAR MANTENIMIENTO
  // ================================

  // Actualiza un mantenimiento y permite agregar nuevas imágenes.
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'imagenes_antes',
          maxCount: MAX_IMAGENES_POR_TIPO,
        },
        {
          name: 'imagenes_despues',
          maxCount: MAX_IMAGENES_POR_TIPO,
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
      imagenes_antes?: Express.Multer.File[];
      imagenes_despues?: Express.Multer.File[];
    },

    @Req()
    request?: Request & {
      user: UsuarioAuditoria;
    },
  ) {
    return this.mantenimientoService.update(
      id,
      dto,
      archivos?.imagenes_antes || [],
      archivos?.imagenes_despues || [],
      request!.user,
    );
  }

  // ================================
  // ELIMINAR MANTENIMIENTO
  // ================================

  // Elimina completamente un mantenimiento.
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request: Request & {
      user: UsuarioAuditoria;
    },
  ) {
    return this.mantenimientoService.remove(
      id,
      request.user,
    );
  }
}