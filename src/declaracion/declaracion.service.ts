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

  // ==========================================
  // CREAR FECHA LOCAL SIN UTC
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
  // CALCULAR VENCIMIENTO +5 AÑOS
  // ==========================================

  private calcularFechaVencimiento(
    fechaDeclaracion: string | Date,
  ): Date {
    const fecha =
      typeof fechaDeclaracion === 'string'
        ? this.crearFechaLocal(
            fechaDeclaracion,
          )
        : new Date(
            fechaDeclaracion.getFullYear(),
            fechaDeclaracion.getMonth(),
            fechaDeclaracion.getDate(),
          );

    const anio =
      fecha.getFullYear();

    const mes =
      fecha.getMonth();

    const dia =
      fecha.getDate();

    const nuevoAnio =
      anio + 5;

    const ultimoDiaMes =
      new Date(
        nuevoAnio,
        mes + 1,
        0,
      ).getDate();

    const diaAjustado =
      Math.min(
        dia,
        ultimoDiaMes,
      );

    return new Date(
      nuevoAnio,
      mes,
      diaAjustado,
    );
  }

  // ==========================================
  // CALCULAR ESTADO
  // ==========================================

  private calcularEstadoDeclaracion(
    fechaVencimiento: string | Date,
  ): string {
    const vencimiento =
      typeof fechaVencimiento === 'string'
        ? this.crearFechaLocal(
            fechaVencimiento,
          )
        : new Date(
            fechaVencimiento.getFullYear(),
            fechaVencimiento.getMonth(),
            fechaVencimiento.getDate(),
          );

    const hoy =
      new Date();

    hoy.setHours(
      0,
      0,
      0,
      0,
    );

    vencimiento.setHours(
      0,
      0,
      0,
      0,
    );

    if (
      vencimiento < hoy
    ) {
      return 'Vencida';
    }

    return 'Vigente';
  }

  // ==========================================
  // CREAR
  // ==========================================

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

    const fechaDeclaracion =
      this.crearFechaLocal(
        createDeclaracionDto
          .fecha_declaracion,
      );

    const fechaVencimiento =
      this.calcularFechaVencimiento(
        fechaDeclaracion,
      );

    const estadoCalculado =
      this.calcularEstadoDeclaracion(
        fechaVencimiento,
      );

    const declaracion =
      this.declaracionRepository.create({
        fecha_declaracion:
          fechaDeclaracion,

        fecha_vencimiento:
          fechaVencimiento,

        estado_declaracion:
          estadoCalculado,

        id_parque:
          createDeclaracionDto
            .id_parque,

        parque,
      });

    return await this.declaracionRepository.save(
      declaracion,
    );
  }

  // ==========================================
  // LISTAR
  // ==========================================

  async findAll():
    Promise<Declaracion[]> {
    const declaraciones =
      await this.declaracionRepository.find({
        relations: {
          parque: true,
        },

        order: {
          fecha_declaracion:
            'DESC',
        },
      });

    for (
      const declaracion
      of declaraciones
    ) {
      const nuevoEstado =
        this.calcularEstadoDeclaracion(
          declaracion
            .fecha_vencimiento,
        );

      if (
        declaracion
          .estado_declaracion !==
        nuevoEstado
      ) {
        declaracion.estado_declaracion =
          nuevoEstado;

        await this.declaracionRepository.save(
          declaracion,
        );
      }
    }

    return declaraciones;
  }

  // ==========================================
  // BUSCAR
  // ==========================================

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

    const nuevoEstado =
      this.calcularEstadoDeclaracion(
        declaracion
          .fecha_vencimiento,
      );

    if (
      declaracion
        .estado_declaracion !==
      nuevoEstado
    ) {
      declaracion.estado_declaracion =
        nuevoEstado;

      await this.declaracionRepository.save(
        declaracion,
      );
    }

    return declaracion;
  }

  // ==========================================
  // ACTUALIZAR
  // ==========================================

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
        this.crearFechaLocal(
          updateDeclaracionDto
            .fecha_declaracion,
        );

      declaracion.fecha_vencimiento =
        this.calcularFechaVencimiento(
          declaracion
            .fecha_declaracion,
        );
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

    declaracion.estado_declaracion =
      this.calcularEstadoDeclaracion(
        declaracion
          .fecha_vencimiento,
      );

    return await this.declaracionRepository.save(
      declaracion,
    );
  }

  // ==========================================
  // ELIMINAR
  // ==========================================

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