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

  // ==========================================
  // CALCULAR ESTADO AUTOMÁTICO
  // ==========================================

  private calcularEstadoConvenio(
    fechaRenovacion: string | Date,
    estadoActual?: string,
  ): string {
    const renovacion = new Date(fechaRenovacion);
    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);
    renovacion.setHours(0, 0, 0, 0);

    // Estos estados son manuales y se respetan
    if (estadoActual === 'Finalizado') {
      return 'Finalizado';
    }

    if (estadoActual === 'Vencido') {
      return 'Vencido';
    }

    // Si la fecha ya pasó
    if (renovacion < hoy) {
      return 'En renovación';
    }

    // Si la fecha todavía no ha pasado
    return 'Vigente';
  }

  // ==========================================
  // CREAR CONVENIO
  // ==========================================

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
        'No se encontró el parque seleccionado.',
      );
    }

    const estadoCalculado = this.calcularEstadoConvenio(
      createConvenioDto.fecha_renovacion_firmas,
      createConvenioDto.estado_convenio,
    );

    const convenio = this.convenioRepository.create({
      fecha_firma: new Date(
        createConvenioDto.fecha_firma,
      ),

      plazo: createConvenioDto.plazo,

      fecha_renovacion_firmas: new Date(
        createConvenioDto.fecha_renovacion_firmas,
      ),

      estado_convenio: estadoCalculado,

      parque,
    });

    return await this.convenioRepository.save(
      convenio,
    );
  }

  // ==========================================
  // OBTENER TODOS LOS CONVENIOS
  // ==========================================

  async findAll(): Promise<Convenio[]> {
    const convenios = await this.convenioRepository.find({
      relations: {
        parque: true,
      },

      order: {
        id_convenio: 'ASC',
      },
    });

    for (const convenio of convenios) {
      const nuevoEstado = this.calcularEstadoConvenio(
        convenio.fecha_renovacion_firmas,
        convenio.estado_convenio,
      );

      if (
        convenio.estado_convenio !== nuevoEstado
      ) {
        convenio.estado_convenio = nuevoEstado;

        await this.convenioRepository.save(
          convenio,
        );
      }
    }

    return convenios;
  }

  // ==========================================
  // OBTENER UN CONVENIO
  // ==========================================

  async findOne(
    id: number,
  ): Promise<Convenio> {
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
        'No se encontró el convenio solicitado.',
      );
    }

    const nuevoEstado = this.calcularEstadoConvenio(
      convenio.fecha_renovacion_firmas,
      convenio.estado_convenio,
    );

    if (
      convenio.estado_convenio !== nuevoEstado
    ) {
      convenio.estado_convenio = nuevoEstado;

      await this.convenioRepository.save(
        convenio,
      );
    }

    return convenio;
  }

  // ==========================================
  // ACTUALIZAR CONVENIO
  // ==========================================

  async update(
    id: number,
    updateConvenioDto: UpdateConvenioDto,
  ): Promise<Convenio> {
    const convenio = await this.findOne(id);

    // FECHA DE FIRMA
    if (
      updateConvenioDto.fecha_firma !==
      undefined
    ) {
      convenio.fecha_firma = new Date(
        updateConvenioDto.fecha_firma,
      );
    }

    // PLAZO
    if (
      updateConvenioDto.plazo !==
      undefined
    ) {
      convenio.plazo =
        updateConvenioDto.plazo;
    }

    // FECHA DE RENOVACIÓN
    if (
      updateConvenioDto.fecha_renovacion_firmas !==
      undefined
    ) {
      convenio.fecha_renovacion_firmas =
        new Date(
          updateConvenioDto.fecha_renovacion_firmas,
        );
    }

    // ESTADO
    if (
      updateConvenioDto.estado_convenio !==
      undefined
    ) {
      convenio.estado_convenio =
        updateConvenioDto.estado_convenio;
    }

    // CAMBIAR PARQUE
    if (
      updateConvenioDto.id_parque !==
      undefined
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
          'No se encontró el parque seleccionado.',
        );
      }

      convenio.parque = parque;
    }

    // ==========================================
    // RECALCULAR ESTADO
    // ==========================================

    convenio.estado_convenio =
      this.calcularEstadoConvenio(
        convenio.fecha_renovacion_firmas,
        convenio.estado_convenio,
      );

    return await this.convenioRepository.save(
      convenio,
    );
  }

  // ==========================================
  // ELIMINAR CONVENIO
  // ==========================================

  async remove(
    id: number,
  ): Promise<{
    message: string;
  }> {
    const convenio =
      await this.findOne(id);

    await this.convenioRepository.remove(
      convenio,
    );

    return {
      message:
        'Convenio eliminado correctamente.',
    };
  }
}