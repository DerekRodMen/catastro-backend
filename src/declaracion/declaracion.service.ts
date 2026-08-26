import {
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
  Declaracion,
} from './entities/declaracion.entity';

import {
  Parque,
} from '../parque/entities/parque.entity';

import {
  CreateDeclaracionDto,
} from './dto/create-declaracion.dto';

import {
  UpdateDeclaracionDto,
} from './dto/update-declaracion.dto';

@Injectable()
export class DeclaracionService {
  constructor(
    @InjectRepository(Declaracion)
    private readonly declaracionRepository:
      Repository<Declaracion>,

    @InjectRepository(Parque)
    private readonly parqueRepository:
      Repository<Parque>,
  ) {}

  // ============================
  // CREAR DECLARACIÓN
  // ============================

  async create(
    createDeclaracionDto:
      CreateDeclaracionDto,
  ): Promise<Declaracion> {
    const parque =
      await this.parqueRepository.findOne({
        where: {
          id_parque:
            createDeclaracionDto.id_parque,
        },
      });

    if (!parque) {
      throw new NotFoundException(
        'No se encontró el parque seleccionado.',
      );
    }

    const declaracion =
      this.declaracionRepository.create({
        fecha_declaracion:
          new Date(
            createDeclaracionDto
              .fecha_declaracion,
          ),

        estado_declaracion:
          createDeclaracionDto
            .estado_declaracion,

        id_parque:
          createDeclaracionDto
            .id_parque,

        parque,
      });

    return await this.declaracionRepository.save(
      declaracion,
    );
  }

  // ============================
  // LISTAR DECLARACIONES
  // ============================

  async findAll():
    Promise<Declaracion[]> {
    return await this.declaracionRepository.find({
      relations: {
        parque: true,
      },

      order: {
        fecha_declaracion:
          'DESC',
      },
    });
  }

  // ============================
  // BUSCAR UNA DECLARACIÓN
  // ============================

  async findOne(
    id: number,
  ): Promise<Declaracion> {
    const declaracion =
      await this.declaracionRepository.findOne({
        where: {
          id_declaracion:
            id,
        },

        relations: {
          parque: true,
        },
      });

    if (!declaracion) {
      throw new NotFoundException(
        'No se encontró la declaración solicitada.',
      );
    }

    return declaracion;
  }

  // ============================
  // ACTUALIZAR DECLARACIÓN
  // ============================

  async update(
    id: number,
    updateDeclaracionDto:
      UpdateDeclaracionDto,
  ): Promise<Declaracion> {
    const declaracion =
      await this.findOne(id);

    if (
      updateDeclaracionDto
        .fecha_declaracion !==
      undefined
    ) {
      declaracion.fecha_declaracion =
        new Date(
          updateDeclaracionDto
            .fecha_declaracion,
        );
    }

    if (
      updateDeclaracionDto
        .estado_declaracion !==
      undefined
    ) {
      declaracion.estado_declaracion =
        updateDeclaracionDto
          .estado_declaracion;
    }

    if (
      updateDeclaracionDto
        .id_parque !==
      undefined
    ) {
      const parque =
        await this.parqueRepository.findOne({
          where: {
            id_parque:
              updateDeclaracionDto
                .id_parque,
          },
        });

      if (!parque) {
        throw new NotFoundException(
          'No se encontró el parque seleccionado.',
        );
      }

      declaracion.id_parque =
        updateDeclaracionDto
          .id_parque;

      declaracion.parque =
        parque;
    }

    return await this.declaracionRepository.save(
      declaracion,
    );
  }

  // ============================
  // ELIMINAR DECLARACIÓN
  // ============================

  async remove(
    id: number,
  ): Promise<{
    message: string;
  }> {
    const declaracion =
      await this.findOne(id);

    await this.declaracionRepository.remove(
      declaracion,
    );

    return {
      message:
        'Declaración eliminada correctamente.',
    };
  }
}