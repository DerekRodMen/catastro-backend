import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  Distrito,
} from './entities/distrito.entity';

import {
  CreateDistritoDto,
} from './dto/create-distrito.dto';

import {
  UpdateDistritoDto,
} from './dto/update-distrito.dto';

import {
  AuditoriaService,
} from '../auditoria/auditoria.service';

import type {
  UsuarioAuditoria,
} from '../auditoria/interfaces/usuario-auditoria.interface';

@Injectable()
export class DistritoService {
  constructor(
    @InjectRepository(Distrito)
    private readonly distritoRepository:
      Repository<Distrito>,

    private readonly auditoriaService:
      AuditoriaService,
  ) {}

  private obtenerDatosAuditoria(
    distrito: Distrito,
  ): Record<string, unknown> {
    return {
      id_distrito:
        distrito.id_distrito,

      nombre_distrito:
        distrito.nombre_distrito,

      numero_distrito:
        distrito.numero_distrito,
    };
  }

  private async registrarAuditoria(
    usuario: UsuarioAuditoria,
    accion: string,
    idRegistro: number,
    descripcion: string,
    datosAnteriores?:
      Record<string, unknown> | null,
    datosNuevos?:
      Record<string, unknown> | null,
  ): Promise<void> {
    try {
      await this.auditoriaService.registrar({
        id_usuario:
          usuario.id_usuario,

        nombre_usuario:
          usuario.nombre_usuario,

        correo_usuario:
          usuario.correo,

        modulo:
          'DISTRITOS',

        accion,

        id_registro:
          idRegistro,

        descripcion,

        datos_anteriores:
          datosAnteriores ?? null,

        datos_nuevos:
          datosNuevos ?? null,
      });
    } catch (error) {
      console.error(
        'Error registrando auditoría de distritos:',
        error,
      );
    }
  }

  // ============================
  // CREAR DISTRITO
  // ============================

  async create(
    createDistritoDto:
      CreateDistritoDto,
    usuario: UsuarioAuditoria,
  ): Promise<Distrito> {
    const distrito =
      this.distritoRepository.create(
        createDistritoDto,
      );

    const guardado =
      await this.distritoRepository.save(
        distrito,
      );

    await this.registrarAuditoria(
      usuario,
      'CREAR',
      guardado.id_distrito,
      `Se creó el distrito "${guardado.nombre_distrito}".`,
      null,
      this.obtenerDatosAuditoria(
        guardado,
      ),
    );

    return guardado;
  }

  // ============================
  // LISTAR DISTRITOS
  // ============================

  async findAll():
    Promise<Distrito[]> {
    return await this.distritoRepository.find({
      relations: {
        parques: true,
      },

      order: {
        numero_distrito:
          'ASC',
      },
    });
  }

  // ============================
  // BUSCAR DISTRITO
  // ============================

  async findOne(
    id: number,
  ): Promise<Distrito> {
    const distrito =
      await this.distritoRepository.findOne({
        where: {
          id_distrito:
            id,
        },

        relations: {
          parques: true,
        },
      });

    if (!distrito) {
      throw new NotFoundException(
        `No se encontró el distrito con ID ${id}.`,
      );
    }

    return distrito;
  }

  // ============================
  // ACTUALIZAR DISTRITO
  // ============================

  async update(
    id: number,
    updateDistritoDto:
      UpdateDistritoDto,
    usuario: UsuarioAuditoria,
  ): Promise<Distrito> {
    const distrito =
      await this.findOne(id);

    const datosAnteriores =
      this.obtenerDatosAuditoria(
        distrito,
      );

    Object.assign(
      distrito,
      updateDistritoDto,
    );

    const guardado =
      await this.distritoRepository.save(
        distrito,
      );

    await this.registrarAuditoria(
      usuario,
      'EDITAR',
      guardado.id_distrito,
      `Se modificó el distrito "${guardado.nombre_distrito}".`,
      datosAnteriores,
      this.obtenerDatosAuditoria(
        guardado,
      ),
    );

    return guardado;
  }

  // ============================
  // ELIMINAR DISTRITO
  // ============================

  async remove(
    id: number,
    usuario: UsuarioAuditoria,
  ): Promise<{
    message: string;
  }> {
    const distrito =
      await this.findOne(id);

    const cantidadParques =
      distrito.parques?.length ??
      0;

    if (
      cantidadParques >
      0
    ) {
      throw new BadRequestException(
        `No se puede eliminar el distrito "${distrito.nombre_distrito}" porque está ligado a ${cantidadParques} parque(s). Primero debe cambiar el distrito de los parques asociados.`,
      );
    }

    const datosAnteriores =
      this.obtenerDatosAuditoria(
        distrito,
      );

    const idDistrito =
      distrito.id_distrito;

    const nombreDistrito =
      distrito.nombre_distrito;

    await this.distritoRepository.remove(
      distrito,
    );

    await this.registrarAuditoria(
      usuario,
      'ELIMINAR',
      idDistrito,
      `Se eliminó el distrito "${nombreDistrito}".`,
      datosAnteriores,
      null,
    );

    return {
      message:
        'Distrito eliminado correctamente.',
    };
  }
}
