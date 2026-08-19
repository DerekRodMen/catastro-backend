import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Distrito } from './entities/distrito.entity';
import { CreateDistritoDto } from './dto/create-distrito.dto';
import { UpdateDistritoDto } from './dto/update-distrito.dto';

@Injectable()
export class DistritoService {
  constructor(
    @InjectRepository(Distrito)
    private readonly distritoRepository: Repository<Distrito>,
  ) {}

  async create(createDistritoDto: CreateDistritoDto): Promise<Distrito> {
    const distrito = this.distritoRepository.create(createDistritoDto);

    return await this.distritoRepository.save(distrito);
  }

  async findAll(): Promise<Distrito[]> {
    return await this.distritoRepository.find({
      relations: {
        parques: true,
      },
    });
  }

  async findOne(id: number): Promise<Distrito> {
    const distrito = await this.distritoRepository.findOne({
      where: {
        id_distrito: id,
      },
      relations: {
        parques: true,
      },
    });

    if (!distrito) {
      throw new NotFoundException(
        `No se encontró el distrito con ID ${id}`,
      );
    }

    return distrito;
  }

  async update(
    id: number,
    updateDistritoDto: UpdateDistritoDto,
  ): Promise<Distrito> {
    const distrito = await this.findOne(id);

    Object.assign(distrito, updateDistritoDto);

    return await this.distritoRepository.save(distrito);
  }

  async remove(id: number): Promise<void> {
    const distrito = await this.findOne(id);

    await this.distritoRepository.remove(distrito);
  }
}