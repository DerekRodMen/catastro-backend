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

  // ============================
  // CREAR ENCARGADO
  // ============================

  async create(
    createEncargadoDto:
      CreateEncargadoDto,
  ): Promise<Encargado> {
    const encargado =
      this.encargadoRepository.create(
        createEncargadoDto,
      );

    return await this.encargadoRepository.save(
      encargado,
    );
  }

  // ============================
  // LISTAR ENCARGADOS
  // ============================

  async findAll():
    Promise<Encargado[]> {
    return await this.encargadoRepository.find({
      relations: {
        parques: true,
      },

      order: {
        id_encargado:
          'ASC',
      },
    });
  }

  // ============================
  // BUSCAR ENCARGADO
  // ============================

  async findOne(
    id: number,
  ): Promise<Encargado> {
    const encargado =
      await this.encargadoRepository.findOne({
        where: {
          id_encargado:
            id,
        },

        relations: {
          parques: true,
        },
      });

    if (!encargado) {
      throw new NotFoundException(
        `No se encontró el encargado con ID ${id}.`,
      );
    }

    return encargado;
  }

  // ============================
  // ACTUALIZAR ENCARGADO
  // ============================

  async update(
    id: number,
    updateEncargadoDto:
      UpdateEncargadoDto,
  ): Promise<Encargado> {
    const encargado =
      await this.findOne(id);

    Object.assign(
      encargado,
      updateEncargadoDto,
    );

    return await this.encargadoRepository.save(
      encargado,
    );
  }

  // ============================
  // ELIMINAR ENCARGADO
  // ============================

  async remove(
    id: number,
  ): Promise<{
    message: string;
  }> {
    const encargado =
      await this.findOne(id);

    const cantidadParques =
      encargado.parques?.length ??
      0;

    if (
      cantidadParques >
      0
    ) {
      const nombre =
        encargado.tipo_encargado ===
        'ASOCIACION'
          ? encargado.nombre_asociacion
          : encargado.nombre_encargado;

      throw new BadRequestException(
        `No se puede eliminar el encargado "${nombre}" porque está ligado a ${cantidadParques} parque(s). Primero debe cambiar el encargado de los parques asociados.`,
      );
    }

    await this.encargadoRepository.remove(
      encargado,
    );

    return {
      message:
        'Encargado eliminado correctamente.',
    };
  }
}