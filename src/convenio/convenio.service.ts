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
  Convenio,
} from './entities/convenio.entity';

import {
  Parque,
} from '../parque/entities/parque.entity';

import {
  CreateConvenioDto,
} from './dto/create-convenio.dto';

import {
  UpdateConvenioDto,
} from './dto/update-convenio.dto';

@Injectable()
export class ConvenioService {
  constructor(
    @InjectRepository(Convenio)
    private readonly convenioRepository:
      Repository<Convenio>,

    @InjectRepository(Parque)
    private readonly parqueRepository:
      Repository<Parque>,
  ) {}

  // ==========================================
  // CREAR FECHA LOCAL SIN PROBLEMAS DE UTC
  // ==========================================

  private crearFechaLocal(
    fecha: string,
  ): Date {
    const [
      anio,
      mes,
      dia,
    ] = fecha
      .split('-')
      .map(Number);

    return new Date(
      anio,
      mes - 1,
      dia,
    );
  }

  // ==========================================
  // CALCULAR ESTADO AUTOMÁTICO
  // ==========================================

  private calcularEstadoConvenio(
    fechaRenovacion: string | Date,
    estadoActual?: string,
  ): string {
    const renovacion =
      typeof fechaRenovacion === 'string'
        ? this.crearFechaLocal(
            fechaRenovacion,
          )
        : new Date(
            fechaRenovacion.getFullYear(),
            fechaRenovacion.getMonth(),
            fechaRenovacion.getDate(),
          );

    const hoy =
      new Date();

    hoy.setHours(
      0,
      0,
      0,
      0,
    );

    renovacion.setHours(
      0,
      0,
      0,
      0,
    );

    if (
      estadoActual ===
      'Finalizado'
    ) {
      return 'Finalizado';
    }

    if (
      estadoActual ===
      'Vencido'
    ) {
      return 'Vencido';
    }

    if (
      renovacion < hoy
    ) {
      return 'En renovación';
    }

    return 'Vigente';
  }

  // ==========================================
  // CREAR CONVENIO
  // ==========================================

  async create(
    createConvenioDto:
      CreateConvenioDto,
  ): Promise<Convenio> {
    const parque =
      await this.parqueRepository.findOne({
        where: {
          id_parque:
            createConvenioDto.id_parque,
        },
      });

    if (!parque) {
      throw new NotFoundException(
        'No se encontró el parque seleccionado.',
      );
    }

    const fechaFirma =
      this.crearFechaLocal(
        createConvenioDto
          .fecha_firma,
      );

    const fechaRenovacion =
      this.crearFechaLocal(
        createConvenioDto
          .fecha_renovacion_firmas,
      );

    const estadoCalculado =
      this.calcularEstadoConvenio(
        fechaRenovacion,
        createConvenioDto
          .estado_convenio,
      );

    const convenio =
      this.convenioRepository.create({
        numero_convenio:
          createConvenioDto
            .numero_convenio
            .trim(),

        fecha_firma:
          fechaFirma,

        plazo:
          createConvenioDto
            .plazo,

        fecha_renovacion_firmas:
          fechaRenovacion,

        estado_convenio:
          estadoCalculado,

        parque,
      });

    return await this.convenioRepository.save(
      convenio,
    );
  }

  // ==========================================
  // OBTENER TODOS LOS CONVENIOS
  // ==========================================

  async findAll():
    Promise<Convenio[]> {
    const convenios =
      await this.convenioRepository.find({
        relations: {
          parque: true,
        },

        order: {
          id_convenio:
            'ASC',
        },
      });

    for (
      const convenio
      of convenios
    ) {
      const nuevoEstado =
        this.calcularEstadoConvenio(
          convenio
            .fecha_renovacion_firmas,

          convenio
            .estado_convenio,
        );

      if (
        convenio
          .estado_convenio !==
        nuevoEstado
      ) {
        convenio.estado_convenio =
          nuevoEstado;

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
    const convenio =
      await this.convenioRepository.findOne({
        where: {
          id_convenio:
            id,
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

    const nuevoEstado =
      this.calcularEstadoConvenio(
        convenio
          .fecha_renovacion_firmas,

        convenio
          .estado_convenio,
      );

    if (
      convenio
        .estado_convenio !==
      nuevoEstado
    ) {
      convenio.estado_convenio =
        nuevoEstado;

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
    updateConvenioDto:
      UpdateConvenioDto,
  ): Promise<Convenio> {
    const convenio =
      await this.findOne(id);

    if (
      updateConvenioDto
        .numero_convenio !==
      undefined
    ) {
      convenio.numero_convenio =
        updateConvenioDto
          .numero_convenio
          .trim();
    }

    if (
      updateConvenioDto
        .fecha_firma !==
      undefined
    ) {
      convenio.fecha_firma =
        this.crearFechaLocal(
          updateConvenioDto
            .fecha_firma,
        );
    }

    if (
      updateConvenioDto
        .plazo !==
      undefined
    ) {
      convenio.plazo =
        updateConvenioDto
          .plazo;
    }

    if (
      updateConvenioDto
        .fecha_renovacion_firmas !==
      undefined
    ) {
      convenio.fecha_renovacion_firmas =
        this.crearFechaLocal(
          updateConvenioDto
            .fecha_renovacion_firmas,
        );
    }

    if (
      updateConvenioDto
        .estado_convenio !==
      undefined
    ) {
      convenio.estado_convenio =
        updateConvenioDto
          .estado_convenio;
    }

    if (
      updateConvenioDto
        .id_parque !==
      undefined
    ) {
      const parque =
        await this.parqueRepository.findOne({
          where: {
            id_parque:
              updateConvenioDto
                .id_parque,
          },
        });

      if (!parque) {
        throw new NotFoundException(
          'No se encontró el parque seleccionado.',
        );
      }

      convenio.parque =
        parque;
    }

    convenio.estado_convenio =
      this.calcularEstadoConvenio(
        convenio
          .fecha_renovacion_firmas,

        convenio
          .estado_convenio,
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