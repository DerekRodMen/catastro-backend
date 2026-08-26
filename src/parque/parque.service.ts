import {
  ConflictException,
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
  Parque,
} from './entities/parque.entity';

import {
  Distrito,
} from '../distrito/entities/distrito.entity';

import {
  Encargado,
} from '../encargado/entities/encargado.entity';

import {
  CreateParqueDto,
} from './dto/create-parque.dto';

import {
  UpdateParqueDto,
} from './dto/update-parque.dto';

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

  // ============================================
  // CREAR PARQUE
  // ============================================

  async create(
    createParqueDto:
      CreateParqueDto,
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
        'No se encontró el distrito seleccionado.',
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
        'No se encontró el encargado seleccionado.',
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

        id_distrito:
          createParqueDto.id_distrito,

        id_encargado:
          createParqueDto.id_encargado,

        distrito,

        encargado,

        // Estos campos pertenecen
        // al módulo de inversiones.
        // Se dejan con valores iniciales
        // mientras se desarrolla ese módulo.

        descripcion_inversion:
          '',

        inversion:
          0,

        fecha_inversion:
          new Date()
            .toISOString()
            .substring(0, 10),
      });

    return await this.parqueRepository.save(
      parque,
    );
  }

  // ============================================
  // LISTAR PARQUES
  // ============================================

  async findAll():
    Promise<Parque[]> {
    return await this.parqueRepository.find({
      relations: {
        distrito: true,
        encargado: true,
        convenios: true,
        declaraciones: true,
      },

      order: {
        id_parque:
          'ASC',
      },
    });
  }

  // ============================================
  // BUSCAR PARQUE
  // ============================================

  async findOne(
    id: number,
  ): Promise<Parque> {
    const parque =
      await this.parqueRepository.findOne({
        where: {
          id_parque:
            id,
        },

        relations: {
          distrito: true,
          encargado: true,
          convenios: true,
          declaraciones: true,
        },
      });

    if (!parque) {
      throw new NotFoundException(
        'No se encontró el parque solicitado.',
      );
    }

    return parque;
  }

  // ============================================
  // ACTUALIZAR PARQUE
  // ============================================

  async update(
    id: number,
    updateParqueDto:
      UpdateParqueDto,
  ): Promise<Parque> {
    const parque =
      await this.findOne(id);

    // ============================================
    // UBICACIÓN
    // ============================================

    if (
      updateParqueDto.ubicacion !==
      undefined
    ) {
      parque.ubicacion =
        updateParqueDto.ubicacion;
    }

    // ============================================
    // NÚMERO DE FINCA
    // ============================================

    if (
      updateParqueDto.numero_finca !==
      undefined
    ) {
      parque.numero_finca =
        updateParqueDto.numero_finca;
    }

    // ============================================
    // ÁREA
    // ============================================

    if (
      updateParqueDto.area !==
      undefined
    ) {
      parque.area =
        updateParqueDto.area;
    }

    // ============================================
    // NÚMERO DE PLANO
    // ============================================

    if (
      updateParqueDto.numero_plano !==
      undefined
    ) {
      parque.numero_plano =
        updateParqueDto.numero_plano;
    }

    // ============================================
    // VISADO
    // ============================================

    if (
      updateParqueDto.visado !==
      undefined
    ) {
      parque.visado =
        updateParqueDto.visado;
    }

    // ============================================
    // ESTADO
    // ============================================

    if (
      updateParqueDto.estado !==
      undefined
    ) {
      parque.estado =
        updateParqueDto.estado;
    }

    // ============================================
    // DISTRITO
    // ============================================

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
          'No se encontró el distrito seleccionado.',
        );
      }

      parque.id_distrito =
        updateParqueDto.id_distrito;

      parque.distrito =
        distrito;
    }

    // ============================================
    // ENCARGADO
    // ============================================

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
          'No se encontró el encargado seleccionado.',
        );
      }

      parque.id_encargado =
        updateParqueDto.id_encargado;

      parque.encargado =
        encargado;
    }

    return await this.parqueRepository.save(
      parque,
    );
  }

  // ============================================
  // ELIMINAR PARQUE
  // ============================================

  async remove(
    id: number,
  ): Promise<{
    message: string;
  }> {
    const parque =
      await this.parqueRepository.findOne({
        where: {
          id_parque:
            id,
        },

        relations: {
          convenios: true,
          declaraciones: true,
        },
      });

    // ============================================
    // PARQUE NO EXISTE
    // ============================================

    if (!parque) {
      throw new NotFoundException(
        'No se encontró el parque solicitado.',
      );
    }

    const tieneConvenios =
      parque.convenios &&
      parque.convenios.length >
        0;

    const tieneDeclaraciones =
      parque.declaraciones &&
      parque.declaraciones.length >
        0;

    // ============================================
    // TIENE CONVENIOS Y DECLARACIONES
    // ============================================

    if (
      tieneConvenios &&
      tieneDeclaraciones
    ) {
      throw new ConflictException(
        'No se puede eliminar este parque porque tiene convenios y declaraciones asociados.',
      );
    }

    // ============================================
    // TIENE CONVENIOS
    // ============================================

    if (tieneConvenios) {
      throw new ConflictException(
        'No se puede eliminar este parque porque tiene uno o más convenios asociados.',
      );
    }

    // ============================================
    // TIENE DECLARACIONES
    // ============================================

    if (tieneDeclaraciones) {
      throw new ConflictException(
        'No se puede eliminar este parque porque tiene una o más declaraciones asociadas.',
      );
    }

    // ============================================
    // ELIMINAR
    // ============================================

    try {
      await this.parqueRepository.remove(
        parque,
      );
    } catch (error: any) {
      console.error(
        'Error eliminando parque:',
        error,
      );

      /*
       * SQL Server utiliza el error 547
       * cuando una FK impide eliminar
       * un registro relacionado.
       *
       * Esta validación adicional evita
       * devolver Internal Server Error
       * incluso si posteriormente se agrega
       * otra relación al parque.
       */

      if (
        error?.number === 547 ||
        error?.driverError?.number ===
          547
      ) {
        throw new ConflictException(
          'No se puede eliminar este parque porque está relacionado con otros registros del sistema.',
        );
      }

      throw error;
    }

    return {
      message:
        'Parque eliminado correctamente.',
    };
  }
}