import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Parque } from './entities/parque.entity';

import { Distrito } from '../distrito/entities/distrito.entity';

import { Encargado } from '../encargado/entities/encargado.entity';

import { CreateParqueDto } from './dto/create-parque.dto';

import { UpdateParqueDto } from './dto/update-parque.dto';

@Injectable()
export class ParqueService {
  constructor(
    @InjectRepository(Parque)
    private readonly parqueRepository:
      Repository<Parque>,

    @InjectRepository(Distrito)
    private readonly distritoRepository:
      Repository<Distrito>,

    @InjectRepository(Encargado)
    private readonly encargadoRepository:
      Repository<Encargado>,
  ) {}

  // ============================
  // CREAR
  // ============================

  async create(
    createParqueDto: CreateParqueDto,
  ) {
    const distrito =
      await this.distritoRepository.findOne({
        where: {
          id_distrito:
            createParqueDto.id_distrito,
        },
      });

    if (!distrito) {
      throw new NotFoundException(
        `No se encontró el distrito con ID ${createParqueDto.id_distrito}`,
      );
    }

    const encargado =
      await this.encargadoRepository.findOne({
        where: {
          id_encargado:
            createParqueDto.id_encargado,
        },
      });

    if (!encargado) {
      throw new NotFoundException(
        `No se encontró el encargado con ID ${createParqueDto.id_encargado}`,
      );
    }

    const parque =
      this.parqueRepository.create({
        ubicacion:
          createParqueDto.ubicacion,

        numero_finca:
          createParqueDto.numero_finca,

        area:
          createParqueDto.area,

        numero_plano:
          createParqueDto.numero_plano,

        visado:
          createParqueDto.visado,

        estado:
          createParqueDto.estado,

        descripcion_inversion:
          createParqueDto.descripcion_inversion,

        inversion:
          createParqueDto.inversion,

        fecha_inversion:
          createParqueDto.fecha_inversion,

        id_distrito:
          createParqueDto.id_distrito,

        id_encargado:
          createParqueDto.id_encargado,

        distrito,

        encargado,
      });

    return this.parqueRepository.save(
      parque,
    );
  }

  // ============================
  // LISTAR TODOS
  // ============================

  async findAll() {
    return this.parqueRepository.find({
      relations: {
        distrito: true,
        encargado: true,
      },

      order: {
        id_parque: 'ASC',
      },
    });
  }

  // ============================
  // BUSCAR UNO
  // ============================

  async findOne(
    id: number,
  ) {
    const parque =
      await this.parqueRepository.findOne({
        where: {
          id_parque: id,
        },

        relations: {
          distrito: true,
          encargado: true,
        },
      });

    if (!parque) {
      throw new NotFoundException(
        `No se encontró el parque con ID ${id}`,
      );
    }

    return parque;
  }

  // ============================
  // ACTUALIZAR
  // ============================

  async update(
    id: number,
    updateParqueDto: UpdateParqueDto,
  ) {
    const parque =
      await this.findOne(id);

    if (
      updateParqueDto.id_distrito !==
      undefined
    ) {
      const distrito =
        await this.distritoRepository.findOne({
          where: {
            id_distrito:
              updateParqueDto.id_distrito,
          },
        });

      if (!distrito) {
        throw new NotFoundException(
          `No se encontró el distrito con ID ${updateParqueDto.id_distrito}`,
        );
      }

      parque.id_distrito =
        updateParqueDto.id_distrito;

      parque.distrito =
        distrito;
    }

    if (
      updateParqueDto.id_encargado !==
      undefined
    ) {
      const encargado =
        await this.encargadoRepository.findOne({
          where: {
            id_encargado:
              updateParqueDto.id_encargado,
          },
        });

      if (!encargado) {
        throw new NotFoundException(
          `No se encontró el encargado con ID ${updateParqueDto.id_encargado}`,
        );
      }

      parque.id_encargado =
        updateParqueDto.id_encargado;

      parque.encargado =
        encargado;
    }

    if (
      updateParqueDto.ubicacion !==
      undefined
    ) {
      parque.ubicacion =
        updateParqueDto.ubicacion;
    }

    if (
      updateParqueDto.numero_finca !==
      undefined
    ) {
      parque.numero_finca =
        updateParqueDto.numero_finca;
    }

    if (
      updateParqueDto.area !==
      undefined
    ) {
      parque.area =
        updateParqueDto.area;
    }

    if (
      updateParqueDto.numero_plano !==
      undefined
    ) {
      parque.numero_plano =
        updateParqueDto.numero_plano;
    }

    if (
      updateParqueDto.visado !==
      undefined
    ) {
      parque.visado =
        updateParqueDto.visado;
    }

    if (
      updateParqueDto.estado !==
      undefined
    ) {
      parque.estado =
        updateParqueDto.estado;
    }

    if (
      updateParqueDto.descripcion_inversion !==
      undefined
    ) {
      parque.descripcion_inversion =
        updateParqueDto.descripcion_inversion;
    }

    if (
      updateParqueDto.inversion !==
      undefined
    ) {
      parque.inversion =
        updateParqueDto.inversion;
    }

    if (
      updateParqueDto.fecha_inversion !==
      undefined
    ) {
      parque.fecha_inversion =
        updateParqueDto.fecha_inversion;
    }

    return this.parqueRepository.save(
      parque,
    );
  }

  // ============================
  // ELIMINAR
  // ============================

  async remove(
    id: number,
  ) {
    const parque =
      await this.findOne(id);

    await this.parqueRepository.remove(
      parque,
    );

    return {
      message:
        'Parque eliminado correctamente',
    };
  }
}