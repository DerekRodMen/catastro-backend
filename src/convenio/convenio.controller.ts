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
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';
import { ConvenioService } from './convenio.service';
import { CreateConvenioDto } from './dto/create-convenio.dto';
import { UpdateConvenioDto } from './dto/update-convenio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UsuarioAuditoria } from '../auditoria/interfaces/usuario-auditoria.interface';

const MAX_DOCUMENTO = 15 * 1024 * 1024;

const configuracionDocumento = {
  storage: memoryStorage(),
  limits: {
    fileSize: MAX_DOCUMENTO,
    files: 1,
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
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!permitidos.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          'Solo se permiten documentos PDF, DOC o DOCX.',
        ),
        false,
      );
    }

    callback(null, true);
  },
};

const limpiarNombre = (
  nombre: string,
): string =>
  nombre
    .replace(/[\r\n"]/g, '_')
    .replace(/[\\/]/g, '_');

const repararNombreUtf8 = (
  nombre: string,
): string => {
  /*
   * Corrige nombres que hayan quedado guardados como:
   * "01 Â· Portada â€” CapCut.pdf"
   * sin dañar nombres ASCII normales.
   */
  if (
    nombre.includes('Ã') ||
    nombre.includes('Â') ||
    nombre.includes('â')
  ) {
    try {
      return Buffer.from(
        nombre,
        'latin1',
      ).toString(
        'utf8',
      );
    } catch {
      return nombre;
    }
  }

  return nombre;
};

const nombreAscii = (
  nombre: string,
): string =>
  nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '_');

const crearContentDisposition = (
  tipo: 'inline' | 'attachment',
  nombre: string,
): string => {
  const limpio =
    limpiarNombre(
      repararNombreUtf8(
        nombre,
      ),
    );

  return (
    `${tipo}; ` +
    `filename="${nombreAscii(limpio)}"; ` +
    `filename*=UTF-8''${encodeURIComponent(limpio)}`
  );
};

@ApiTags('Convenios')
@Controller('convenios')
export class ConvenioController {
  constructor(
    private readonly convenioService:
      ConvenioService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body()
    createConvenioDto:
      CreateConvenioDto,
    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.convenioService.create(
      createConvenioDto,
      request.user,
    );
  }

  @Get()
  findAll() {
    return this.convenioService.findAll();
  }

  @Post(':id/documento')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor(
      'documento',
      configuracionDocumento,
    ),
  )
  subirDocumento(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
    @UploadedFile()
    archivo:
      Express.Multer.File,
    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    if (!archivo) {
      throw new BadRequestException(
        'Debe seleccionar un documento.',
      );
    }

    return this.convenioService.guardarDocumento(
      id,
      archivo,
      request.user,
    );
  }

  @Post(':id/documento/enlace')
  @UseGuards(JwtAuthGuard)
  async crearEnlaceDocumento(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
    @Req()
    request:
      Request,
  ) {
    const documento =
      await this.convenioService.obtenerDocumento(
        id,
      );

    const token =
      this.convenioService.crearTokenDocumento(
        id,
        'ver',
      );

    const nombre =
      limpiarNombre(
        repararNombreUtf8(
          documento.nombre,
        ),
      );

    const protocolo =
      request.protocol;

    const host =
      request.get(
        'host',
      );

    return {
      url:
        `${protocolo}://${host}` +
        `/convenios/${id}/documento/archivo/` +
        `${encodeURIComponent(nombre)}` +
        `?token=${encodeURIComponent(token)}`,
    };
  }

  @Get(
    ':id/documento/archivo/:nombre',
  )
  async obtenerDocumentoPublico(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
    @Param('nombre')
    _nombre:
      string,
    @Query('token')
    token:
      string,
    @Res()
    response:
      Response,
  ) {
    this.convenioService.consumirTokenDocumento(
      token,
      id,
    );

    const documento =
      await this.convenioService.obtenerDocumento(
        id,
      );

    const nombre =
      repararNombreUtf8(
        documento.nombre,
      );

    const esPdf =
      documento.mime ===
        'application/pdf' ||
      nombre
        .toLowerCase()
        .endsWith(
          '.pdf',
        );

    const mime =
      esPdf
        ? 'application/pdf'
        : documento.mime;

    response.status(200);

    response.setHeader(
      'Content-Type',
      mime,
    );

    response.setHeader(
      'Content-Disposition',
      crearContentDisposition(
        esPdf
          ? 'inline'
          : 'attachment',
        nombre,
      ),
    );

    response.setHeader(
      'Content-Length',
      documento.buffer.length.toString(),
    );

    response.setHeader(
      'X-Content-Type-Options',
      'nosniff',
    );

    response.setHeader(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate',
    );

    response.setHeader(
      'Pragma',
      'no-cache',
    );

    response.setHeader(
      'Expires',
      '0',
    );

    response.end(
      documento.buffer,
    );
  }

  @Get(':id/documento')
  @UseGuards(JwtAuthGuard)
  async obtenerDocumento(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
    @Res()
    response:
      Response,
  ) {
    const documento =
      await this.convenioService.obtenerDocumento(
        id,
      );

    const nombre =
      repararNombreUtf8(
        documento.nombre,
      );

    response.setHeader(
      'Content-Type',
      documento.mime,
    );

    response.setHeader(
      'Content-Disposition',
      crearContentDisposition(
        'attachment',
        nombre,
      ),
    );

    response.setHeader(
      'Content-Length',
      documento.buffer.length.toString(),
    );

    response.end(
      documento.buffer,
    );
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.convenioService.findOne(
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
    updateConvenioDto:
      UpdateConvenioDto,
    @Req()
    request:
      Request & {
        user: UsuarioAuditoria;
      },
  ) {
    return this.convenioService.update(
      id,
      updateConvenioDto,
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
    return this.convenioService.remove(
      id,
      request.user,
    );
  }
}
