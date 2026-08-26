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

@Injectable()
export class DistritoService {
  constructor(
    @InjectRepository(Distrito)
    private readonly distritoRepository:
      Repository<Distrito>,
  ) {}

  // ============================
  // CREAR DISTRITO
  // ============================

  async create(
    createDistritoDto:
      CreateDistritoDto,
  ): Promise<Distrito> {
    const distrito =
      this.distritoRepository.create(
        createDistritoDto,
      );

    return await this.distritoRepository.save(
      distrito,
    );
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
  ): Promise<Distrito> {
    const distrito =
      await this.findOne(id);

    Object.assign(
      distrito,
      updateDistritoDto,
    );

    return await this.distritoRepository.save(
      distrito,
    );
  }

  // ============================
  // ELIMINAR DISTRITO
  // ============================

  async remove(
    id: number,
  ): Promise<{
    message: string;
  }> {
    const distrito =
      await this.findOne(id);

    // Como findOne carga la relación
    // "parques", podemos comprobarla
    // antes de intentar eliminar.

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

    await this.distritoRepository.remove(
      distrito,
    );

    return {
      message:
        'Distrito eliminado correctamente.',
    };
  }
}