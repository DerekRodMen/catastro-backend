import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  QueryFailedError,
  Repository,
} from 'typeorm';

import {
  Encargado,
} from './entities/encargado.entity';

import {
  CreateEncargadoDto,
} from './dto/create-encargado.dto';

import {
  UpdateEncargadoDto,
} from './dto/update-encargado.dto';

import {
  AuditoriaService,
} from '../auditoria/auditoria.service';

import type {
  UsuarioAuditoria,
} from '../auditoria/interfaces/usuario-auditoria.interface';

@Injectable()
export class EncargadoService {
  constructor(
    @InjectRepository(Encargado)
    private readonly encargadoRepository:
      Repository<Encargado>,

    private readonly auditoriaService:
      AuditoriaService,
  ) {}

  private obtenerDatosAuditoria(
    encargado: Encargado,
  ): Record<string, unknown> {
    return {
      id_encargado:
        encargado.id_encargado,

      entidad_encargada:
        encargado.entidad_encargada,

      cedula_juridica:
        encargado.cedula_juridica,

      representante_legal:
        encargado.representante_legal,

      correo_encargado:
        encargado.correo_encargado,

      telefono_encargado:
        encargado.telefono_encargado,
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
          'ENCARGADOS',

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
        'Error registrando auditoría de encargados:',
        error,
      );
    }
  }

  // ============================================
  // CREAR
  // ============================================

  async create(
    createEncargadoDto:
      CreateEncargadoDto,
    usuario: UsuarioAuditoria,
  ): Promise<Encargado> {
    const correo =
      createEncargadoDto.correo_encargado
        .trim()
        .toLowerCase();

    const existente =
      await this.encargadoRepository.findOne({
        where: {
          correo_encargado:
            correo,
        },
      });

    if (existente) {
      throw new ConflictException(
        'Ya existe un encargado registrado con ese correo electrónico.',
      );
    }

    const encargado =
      this.encargadoRepository.create({
        entidad_encargada:
          createEncargadoDto
            .entidad_encargada
            .trim(),

        cedula_juridica:
          createEncargadoDto
            .cedula_juridica
            ?.trim() ||
          null,

        representante_legal:
          createEncargadoDto
            .representante_legal
            .trim(),

        correo_encargado:
          correo,

        telefono_encargado:
          createEncargadoDto
            .telefono_encargado
            .trim(),
      });

    const guardado =
      await this.encargadoRepository.save(
        encargado,
      );

    await this.registrarAuditoria(
      usuario,
      'CREAR',
      guardado.id_encargado,
      `Se creó el encargado "${guardado.entidad_encargada}".`,
      null,
      this.obtenerDatosAuditoria(
        guardado,
      ),
    );

    return guardado;
  }

  // ============================================
  // LISTAR
  // ============================================

  async findAll():
    Promise<Encargado[]> {
    return await this.encargadoRepository.find({
      order: {
        entidad_encargada:
          'ASC',
      },
    });
  }

  // ============================================
  // BUSCAR POR ID
  // ============================================

  async findOne(
    id: number,
  ): Promise<Encargado> {
    const encargado =
      await this.encargadoRepository.findOne({
        where: {
          id_encargado:
            id,
        },
      });

    if (!encargado) {
      throw new NotFoundException(
        'No se encontró el encargado solicitado.',
      );
    }

    return encargado;
  }

  // ============================================
  // ACTUALIZAR
  // ============================================

  async update(
    id: number,
    updateEncargadoDto:
      UpdateEncargadoDto,
    usuario: UsuarioAuditoria,
  ): Promise<Encargado> {
    const encargado =
      await this.findOne(id);

    const datosAnteriores =
      this.obtenerDatosAuditoria(
        encargado,
      );

    if (
      updateEncargadoDto
        .entidad_encargada !==
      undefined
    ) {
      encargado.entidad_encargada =
        updateEncargadoDto
          .entidad_encargada
          .trim();
    }

    if (
      updateEncargadoDto
        .cedula_juridica !==
      undefined
    ) {
      encargado.cedula_juridica =
        updateEncargadoDto
          .cedula_juridica
          ?.trim() ||
        null;
    }

    if (
      updateEncargadoDto
        .representante_legal !==
      undefined
    ) {
      encargado.representante_legal =
        updateEncargadoDto
          .representante_legal
          .trim();
    }

    if (
      updateEncargadoDto
        .correo_encargado !==
      undefined
    ) {
      const correo =
        updateEncargadoDto
          .correo_encargado
          .trim()
          .toLowerCase();

      const existente =
        await this.encargadoRepository.findOne({
          where: {
            correo_encargado:
              correo,
          },
        });

      if (
        existente &&
        existente.id_encargado !==
          id
      ) {
        throw new ConflictException(
          'Ya existe un encargado registrado con ese correo electrónico.',
        );
      }

      encargado.correo_encargado =
        correo;
    }

    if (
      updateEncargadoDto
        .telefono_encargado !==
      undefined
    ) {
      encargado.telefono_encargado =
        updateEncargadoDto
          .telefono_encargado
          .trim();
    }

    const guardado =
      await this.encargadoRepository.save(
        encargado,
      );

    await this.registrarAuditoria(
      usuario,
      'EDITAR',
      guardado.id_encargado,
      `Se modificó el encargado "${guardado.entidad_encargada}".`,
      datosAnteriores,
      this.obtenerDatosAuditoria(
        guardado,
      ),
    );

    return guardado;
  }

  // ============================================
  // ELIMINAR
  // ============================================

  async remove(
    id: number,
    usuario: UsuarioAuditoria,
  ): Promise<{
    message: string;
  }> {
    const encargado =
      await this.findOne(id);

    const datosAnteriores =
      this.obtenerDatosAuditoria(
        encargado,
      );

    const idEncargado =
      encargado.id_encargado;

    const nombreEncargado =
      encargado.entidad_encargada;

    try {
      await this.encargadoRepository.remove(
        encargado,
      );

      await this.registrarAuditoria(
        usuario,
        'ELIMINAR',
        idEncargado,
        `Se eliminó el encargado "${nombreEncargado}".`,
        datosAnteriores,
        null,
      );

      return {
        message:
          'Encargado eliminado correctamente.',
      };
    } catch (error) {
      if (
        error instanceof
          QueryFailedError
      ) {
        const driverError =
          (
            error as QueryFailedError & {
              driverError?: {
                number?: number;
              };
            }
          ).driverError;

        if (
          driverError?.number ===
          547
        ) {
          throw new BadRequestException(
            'No se puede eliminar este encargado porque se encuentra asociado a uno o más parques.',
          );
        }
      }

      throw error;
    }
  }
}
