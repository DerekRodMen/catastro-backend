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
  Auditoria,
} from './entities/auditoria.entity';

import {
  CrearAuditoriaDto,
} from './dto/crear-auditoria.dto';


export interface FiltrosAuditoria {
  usuario?: string;
  modulo?: string;
  accion?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}


@Injectable()
export class AuditoriaService {

  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository:
      Repository<Auditoria>,
  ) {}


  // ============================================
  // REGISTRAR AUDITORÍA
  // ============================================

  async registrar(
    dto: CrearAuditoriaDto,
  ): Promise<Auditoria> {

    const auditoria =
      this.auditoriaRepository.create({

        id_usuario:
          dto.id_usuario ?? null,

        nombre_usuario:
          dto.nombre_usuario ?? null,

        correo_usuario:
          dto.correo_usuario ?? null,

        modulo:
          dto.modulo.trim(),

        accion:
          dto.accion
            .trim()
            .toUpperCase(),

        id_registro:
          dto.id_registro ?? null,

        descripcion:
          dto.descripcion.trim(),

        datos_anteriores:
          dto.datos_anteriores
            ? JSON.stringify(
                dto.datos_anteriores,
              )
            : null,

        datos_nuevos:
          dto.datos_nuevos
            ? JSON.stringify(
                dto.datos_nuevos,
              )
            : null,
      });

    return await this.auditoriaRepository.save(
      auditoria,
    );
  }


  // ============================================
  // LISTAR AUDITORÍAS
  // ============================================

  async findAll(
    filtros: FiltrosAuditoria = {},
  ): Promise<Auditoria[]> {

    const query =
      this.auditoriaRepository
        .createQueryBuilder('auditoria')
        .leftJoinAndSelect(
          'auditoria.usuario',
          'usuario',
        );


    // ============================================
    // USUARIO
    // ============================================

    if (
      filtros.usuario &&
      filtros.usuario.trim()
    ) {
      query.andWhere(
        `(
          auditoria.nombre_usuario LIKE :usuario
          OR
          auditoria.correo_usuario LIKE :usuario
        )`,
        {
          usuario:
            `%${filtros.usuario.trim()}%`,
        },
      );
    }


    // ============================================
    // MÓDULO
    // ============================================

    if (
      filtros.modulo &&
      filtros.modulo.trim()
    ) {
      query.andWhere(
        'auditoria.modulo = :modulo',
        {
          modulo:
            filtros.modulo.trim(),
        },
      );
    }


    // ============================================
    // ACCIÓN
    // ============================================

    if (
      filtros.accion &&
      filtros.accion.trim()
    ) {
      query.andWhere(
        'auditoria.accion = :accion',
        {
          accion:
            filtros.accion
              .trim()
              .toUpperCase(),
        },
      );
    }


    // ============================================
    // FECHA DESDE
    // ============================================

    if (
      filtros.fecha_desde &&
      filtros.fecha_desde.trim()
    ) {
      query.andWhere(
        'auditoria.fecha_hora >= :fechaDesde',
        {
          fechaDesde:
            `${filtros.fecha_desde}T00:00:00`,
        },
      );
    }


    // ============================================
    // FECHA HASTA
    // ============================================

    if (
      filtros.fecha_hasta &&
      filtros.fecha_hasta.trim()
    ) {
      query.andWhere(
        'auditoria.fecha_hora < DATEADD(day, 1, CAST(:fechaHasta AS date))',
        {
          fechaHasta:
            filtros.fecha_hasta,
        },
      );
    }


    query.orderBy(
      'auditoria.fecha_hora',
      'DESC',
    );

    query.addOrderBy(
      'auditoria.id_auditoria',
      'DESC',
    );


    return await query.getMany();
  }


  // ============================================
  // BUSCAR AUDITORÍA POR ID
  // ============================================

  async findOne(
    id: number,
  ): Promise<Auditoria> {

    const auditoria =
      await this.auditoriaRepository.findOne({
        where: {
          id_auditoria: id,
        },

        relations: {
          usuario: true,
        },
      });


    if (!auditoria) {
      throw new NotFoundException(
        'No se encontró el registro de auditoría solicitado.',
      );
    }


    return auditoria;
  }
}