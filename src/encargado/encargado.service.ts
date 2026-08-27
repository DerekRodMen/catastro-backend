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

@Injectable()
export class EncargadoService {
  constructor(
    @InjectRepository(Encargado)
    private readonly encargadoRepository:
      Repository<Encargado>,
  ) {}

  // ============================================
  // CREAR
  // ============================================

  async create(
    createEncargadoDto:
      CreateEncargadoDto,
  ): Promise<Encargado> {
    const correo =
      createEncargadoDto.correo_encargado
        .trim()
        .toLowerCase();

    const existente =
      await this.encargadoRepository.findOne({
        where: {
          correo_encargado: correo,
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

    return await this.encargadoRepository.save(
      encargado,
    );
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
  ): Promise<Encargado> {
    const encargado =
      await this.findOne(id);

    // ============================================
    // ENTIDAD ENCARGADA
    // ============================================

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

    // ============================================
    // CÉDULA JURÍDICA
    // ============================================

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

    // ============================================
    // REPRESENTANTE LEGAL
    // ============================================

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

    // ============================================
    // CORREO
    // ============================================

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

    // ============================================
    // TELÉFONO
    // ============================================

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

    return await this.encargadoRepository.save(
      encargado,
    );
  }

  // ============================================
  // ELIMINAR
  // ============================================

  async remove(
    id: number,
  ): Promise<{
    message: string;
  }> {
    const encargado =
      await this.findOne(id);

    try {
      await this.encargadoRepository.remove(
        encargado,
      );

      return {
        message:
          'Encargado eliminado correctamente.',
      };
    } catch (error) {
      /*
       * SQL Server:
       * 547 = conflicto con FOREIGN KEY.
       *
       * Por ejemplo:
       * el encargado está relacionado
       * con uno o más parques.
       */

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