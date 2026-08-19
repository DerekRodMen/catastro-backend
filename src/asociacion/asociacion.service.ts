import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Asociacion } from './entities/asociacion.entity';
import { CreateAsociacionDto } from './dto/create-asociacion.dto';
import { UpdateAsociacionDto } from './dto/update-asociacion.dto';

@Injectable()
export class AsociacionService {
  constructor(
    @InjectRepository(Asociacion)
    private readonly asociacionRepository: Repository<Asociacion>,
  ) {}

  async create(
    createAsociacionDto: CreateAsociacionDto,
  ): Promise<Asociacion> {
    const asociacion =
      this.asociacionRepository.create(
        createAsociacionDto,
      );

    return await this.asociacionRepository.save(
      asociacion,
    );
  }

  async findAll(): Promise<Asociacion[]> {
    return await this.asociacionRepository.find();
  }

  async findOne(id: number): Promise<Asociacion> {
    const asociacion =
      await this.asociacionRepository.findOne({
        where: {
          id_asociacion: id,
        },
      });

    if (!asociacion) {
      throw new NotFoundException(
        `No se encontró la asociación con ID ${id}`,
      );
    }

    return asociacion;
  }

  async update(
    id: number,
    updateAsociacionDto: UpdateAsociacionDto,
  ): Promise<Asociacion> {
    const asociacion =
      await this.findOne(id);

    Object.assign(
      asociacion,
      updateAsociacionDto,
    );

    return await this.asociacionRepository.save(
      asociacion,
    );
  }

  async remove(id: number): Promise<void> {
    const asociacion =
      await this.findOne(id);

    await this.asociacionRepository.remove(
      asociacion,
    );
  }
}