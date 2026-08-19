import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Parque } from './entities/parque.entity';
import { CreateParqueDto } from './dto/create-parque.dto';
import { UpdateParqueDto } from './dto/update-parque.dto';

import { Distrito } from '../distrito/entities/distrito.entity';
import { Asociacion } from '../asociacion/entities/asociacion.entity';

@Injectable()
export class ParqueService {
  constructor(
    @InjectRepository(Parque)
    private readonly parqueRepository: Repository<Parque>,

    @InjectRepository(Distrito)
    private readonly distritoRepository: Repository<Distrito>,

    @InjectRepository(Asociacion)
    private readonly asociacionRepository: Repository<Asociacion>,
  ) {}

  async create(
    createParqueDto: CreateParqueDto,
  ): Promise<Parque> {

    const distrito =
      await this.distritoRepository.findOne({
        where: {
          id_distrito:
            createParqueDto.id_distrito,
        },
      });

    if (!distrito) {
      throw new NotFoundException(
        `No existe el distrito con ID ${createParqueDto.id_distrito}`,
      );
    }

    const asociacion =
      await this.asociacionRepository.findOne({
        where: {
          id_asociacion:
            createParqueDto.id_asociacion,
        },
      });

    if (!asociacion) {
      throw new NotFoundException(
        `No existe la asociación con ID ${createParqueDto.id_asociacion}`,
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
          new Date(
            createParqueDto.fecha_inversion,
          ),

        distrito,

        asociacion,
      });

    return await this.parqueRepository.save(
      parque,
    );
  }

  async findAll(): Promise<Parque[]> {
    return await this.parqueRepository.find({
      relations: {
        distrito: true,
        asociacion: true,
        convenios: true,
        declaraciones: true,
      },
    });
  }

  async findOne(id: number): Promise<Parque> {
    const parque =
      await this.parqueRepository.findOne({
        where: {
          id_parque: id,
        },
        relations: {
          distrito: true,
          asociacion: true,
          convenios: true,
          declaraciones: true,
        },
      });

    if (!parque) {
      throw new NotFoundException(
        `No se encontró el parque con ID ${id}`,
      );
    }

    return parque;
  }

  async update(
    id: number,
    updateParqueDto: UpdateParqueDto,
  ): Promise<Parque> {

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
          `No existe el distrito con ID ${updateParqueDto.id_distrito}`,
        );
      }

      parque.distrito = distrito;
    }

    if (
      updateParqueDto.id_asociacion !==
      undefined
    ) {
      const asociacion =
        await this.asociacionRepository.findOne({
          where: {
            id_asociacion:
              updateParqueDto.id_asociacion,
          },
        });

      if (!asociacion) {
        throw new NotFoundException(
          `No existe la asociación con ID ${updateParqueDto.id_asociacion}`,
        );
      }

      parque.asociacion = asociacion;
    }

    Object.assign(parque, {
      ...updateParqueDto,
      id_distrito: undefined,
      id_asociacion: undefined,
    });

    return await this.parqueRepository.save(
      parque,
    );
  }

  async remove(id: number): Promise<void> {
    const parque =
      await this.findOne(id);

    await this.parqueRepository.remove(
      parque,
    );
  }
}