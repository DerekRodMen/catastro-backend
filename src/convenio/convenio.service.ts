import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Convenio } from './entities/convenio.entity';
import { Parque } from '../parque/entities/parque.entity';

import { CreateConvenioDto } from './dto/create-convenio.dto';
import { UpdateConvenioDto } from './dto/update-convenio.dto';

@Injectable()
export class ConvenioService {
  constructor(
    @InjectRepository(Convenio)
    private readonly convenioRepository: Repository<Convenio>,

    @InjectRepository(Parque)
    private readonly parqueRepository: Repository<Parque>,
  ) {}

  // CREAR CONVENIO
  async create(
    createConvenioDto: CreateConvenioDto,
  ): Promise<Convenio> {

    const parque = await this.parqueRepository.findOne({
      where: {
        id_parque: createConvenioDto.id_parque,
      },
    });

    if (!parque) {
      throw new NotFoundException(
        `No existe el parque con ID ${createConvenioDto.id_parque}`,
      );
    }

    const convenio = this.convenioRepository.create({
      fecha_firma: new Date(
        createConvenioDto.fecha_firma,
      ),

      plazo: createConvenioDto.plazo,

      fecha_renovacion_firmas: new Date(
        createConvenioDto.fecha_renovacion_firmas,
      ),

      estado_convenio:
        createConvenioDto.estado_convenio,

      parque: parque,
    });

    return await this.convenioRepository.save(convenio);
  }

  // OBTENER TODOS LOS CONVENIOS
  async findAll(): Promise<Convenio[]> {
    return await this.convenioRepository.find({
      relations: {
        parque: true,
      },
    });
  }

  // OBTENER UN CONVENIO POR ID
  async findOne(id: number): Promise<Convenio> {
    const convenio = await this.convenioRepository.findOne({
      where: {
        id_convenio: id,
      },

      relations: {
        parque: true,
      },
    });

    if (!convenio) {
      throw new NotFoundException(
        `No existe el convenio con ID ${id}`,
      );
    }

    return convenio;
  }

  // ACTUALIZAR CONVENIO
  async update(
    id: number,
    updateConvenioDto: UpdateConvenioDto,
  ): Promise<Convenio> {

    const convenio = await this.findOne(id);

    if (updateConvenioDto.fecha_firma) {
      convenio.fecha_firma = new Date(
        updateConvenioDto.fecha_firma,
      );
    }

    if (updateConvenioDto.plazo !== undefined) {
      convenio.plazo = updateConvenioDto.plazo;
    }

    if (
      updateConvenioDto.fecha_renovacion_firmas
    ) {
      convenio.fecha_renovacion_firmas =
        new Date(
          updateConvenioDto.fecha_renovacion_firmas,
        );
    }

    if (updateConvenioDto.estado_convenio) {
      convenio.estado_convenio =
        updateConvenioDto.estado_convenio;
    }

    // CAMBIAR PARQUE
    if (
      updateConvenioDto.id_parque !== undefined
    ) {

      const parque =
        await this.parqueRepository.findOne({
          where: {
            id_parque:
              updateConvenioDto.id_parque,
          },
        });

      if (!parque) {
        throw new NotFoundException(
          `No existe el parque con ID ${updateConvenioDto.id_parque}`,
        );
      }

      convenio.parque = parque;
    }

    return await this.convenioRepository.save(
      convenio,
    );
  }

  // ELIMINAR CONVENIO
  async remove(id: number): Promise<void> {

    const convenio =
      await this.findOne(id);

    await this.convenioRepository.remove(
      convenio,
    );
  }
}