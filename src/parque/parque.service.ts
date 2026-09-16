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

import {
  AuditoriaService,
} from '../auditoria/auditoria.service';


// ============================================
// USUARIO AUTENTICADO
// ============================================

export interface UsuarioAuditoria {
  id_usuario: number;
  correo: string;
  nombre_usuario: string | null;
}


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

    private readonly auditoriaService:
      AuditoriaService,
  ) {}


  // ============================================
  // DATOS PARA AUDITORÍA
  // ============================================

  private obtenerDatosAuditoria(
    parque: Parque,
  ): Record<string, unknown> {

    return {
      id_parque:
        parque.id_parque,

      ubicacion:
        parque.ubicacion,

      numero_finca:
        parque.numero_finca,

      area:
        parque.area,

      numero_plano:
        parque.numero_plano,

      visado:
        parque.visado,

      estado:
        parque.estado,

      id_distrito:
        parque.id_distrito,

      distrito:
        parque.distrito
          ?.nombre_distrito ??
        null,

      id_encargado:
        parque.id_encargado,

      encargado:
        parque.encargado
          ?.entidad_encargada ??
        null,
    };
  }


  // ============================================
  // REGISTRAR AUDITORÍA
  // ============================================

  private async registrarAuditoria(
    usuario: UsuarioAuditoria,
    accion: string,
    idRegistro: number,
    descripcion: string,
    datosAnteriores?:
      Record<string, unknown> | null,
    datosNuevos?:
      Record<string, unknown> | null,
  ): Promise<void> {

    try {
      await this.auditoriaService.registrar({
        id_usuario:
          usuario.id_usuario,

        nombre_usuario:
          usuario.nombre_usuario,

        correo_usuario:
          usuario.correo,

        modulo:
          'PARQUES',

        accion,

        id_registro:
          idRegistro,

        descripcion,

        datos_anteriores:
          datosAnteriores ?? null,

        datos_nuevos:
          datosNuevos ?? null,
      });
    } catch (error) {

      /*
       * No hacemos fallar la operación principal
       * únicamente porque falle el registro
       * de auditoría.
       *
       * El error sí queda registrado en consola
       * para poder detectarlo.
       */

      console.error(
        'Error registrando auditoría de parques:',
        error,
      );
    }
  }


  // ============================================
  // VALIDAR NÚMERO DE FINCA ÚNICO
  // ============================================

  private async validarNumeroFincaUnico(
    numeroFinca: string,
    idParqueActual?: number,
  ): Promise<void> {

    const existente =
      await this.parqueRepository.findOne({
        where: {
          numero_finca:
            numeroFinca.trim(),
        },
      });

    if (
      existente &&
      existente.id_parque !==
        idParqueActual
    ) {
      throw new ConflictException(
        'Ya existe un parque registrado con este número de finca.',
      );
    }
  }


  // ============================================
  // VALIDAR NÚMERO DE PLANO ÚNICO
  // ============================================

  private async validarNumeroPlanoUnico(
    numeroPlano: string,
    idParqueActual?: number,
  ): Promise<void> {

    const existente =
      await this.parqueRepository.findOne({
        where: {
          numero_plano:
            numeroPlano.trim(),
        },
      });

    if (
      existente &&
      existente.id_parque !==
        idParqueActual
    ) {
      throw new ConflictException(
        'Ya existe un parque registrado con este número de plano.',
      );
    }
  }


  // ============================================
  // MANEJAR ERRORES UNIQUE SQL SERVER
  // ============================================

  private manejarErrorDuplicado(
    error: any,
  ): never {

    const numeroError =
      error?.number ??
      error?.driverError?.number;

    if (
      numeroError === 2601 ||
      numeroError === 2627
    ) {

      const mensaje =
        String(
          error?.message ??
          error?.driverError?.message ??
          '',
        ).toLowerCase();

      if (
        mensaje.includes(
          'numero_finca',
        )
      ) {
        throw new ConflictException(
          'Ya existe un parque registrado con este número de finca.',
        );
      }

      if (
        mensaje.includes(
          'numero_plano',
        )
      ) {
        throw new ConflictException(
          'Ya existe un parque registrado con este número de plano.',
        );
      }

      throw new ConflictException(
        'No se puede guardar el parque porque existe un dato único repetido.',
      );
    }

    throw error;
  }


  // ============================================
  // CREAR PARQUE
  // ============================================

  async create(
    createParqueDto:
      CreateParqueDto,

    usuario:
      UsuarioAuditoria,
  ): Promise<Parque> {

    const numeroFinca =
      createParqueDto
        .numero_finca
        .trim();

    const numeroPlano =
      createParqueDto
        .numero_plano
        .trim();


    await this.validarNumeroFincaUnico(
      numeroFinca,
    );

    await this.validarNumeroPlanoUnico(
      numeroPlano,
    );


    // ============================================
    // DISTRITO
    // ============================================

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


    // ============================================
    // ENCARGADO
    // ============================================

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


    // ============================================
    // CREAR ENTIDAD
    // ============================================

    const parque =
      this.parqueRepository.create({

        ubicacion:
          createParqueDto
            .ubicacion
            .trim(),

        numero_finca:
          numeroFinca,

        area:
          createParqueDto.area,

        numero_plano:
          numeroPlano,

        visado:
          createParqueDto.visado,

        estado:
          createParqueDto.estado,

        id_distrito:
          createParqueDto
            .id_distrito,

        id_encargado:
          createParqueDto
            .id_encargado,

        distrito,

        encargado,

        // Campos antiguos de inversión
        descripcion_inversion:
          '',

        inversion:
          0,

        fecha_inversion:
          new Date()
            .toISOString()
            .substring(
              0,
              10,
            ),
      });


    // ============================================
    // GUARDAR
    // ============================================

    let parqueGuardado:
      Parque;

    try {

      parqueGuardado =
        await this.parqueRepository.save(
          parque,
        );

    } catch (error: any) {

      this.manejarErrorDuplicado(
        error,
      );
    }


    // ============================================
    // AUDITORÍA - CREAR
    // ============================================

    await this.registrarAuditoria(
      usuario,

      'CREAR',

      parqueGuardado.id_parque,

      `Se creó el parque con finca ${parqueGuardado.numero_finca}.`,

      null,

      this.obtenerDatosAuditoria(
        parqueGuardado,
      ),
    );


    return parqueGuardado;
  }


  // ============================================
  // LISTAR PARQUES
  // ============================================

  async findAll():
    Promise<Parque[]> {

    return await this.parqueRepository.find({

      relations: {
        distrito:
          true,

        encargado:
          true,

        convenios:
          true,

        declaraciones:
          true,
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
          distrito:
            true,

          encargado:
            true,

          convenios:
            true,

          declaraciones:
            true,
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

    usuario:
      UsuarioAuditoria,
  ): Promise<Parque> {

    const parque =
      await this.findOne(
        id,
      );


    // ============================================
    // GUARDAR ESTADO ANTERIOR
    // ============================================

    const datosAnteriores =
      this.obtenerDatosAuditoria(
        parque,
      );


    // ============================================
    // UBICACIÓN
    // ============================================

    if (
      updateParqueDto.ubicacion !==
      undefined
    ) {
      parque.ubicacion =
        updateParqueDto
          .ubicacion
          .trim();
    }


    // ============================================
    // NÚMERO DE FINCA
    // ============================================

    if (
      updateParqueDto.numero_finca !==
      undefined
    ) {

      const numeroFinca =
        updateParqueDto
          .numero_finca
          .trim();

      await this.validarNumeroFincaUnico(
        numeroFinca,
        id,
      );

      parque.numero_finca =
        numeroFinca;
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

      const numeroPlano =
        updateParqueDto
          .numero_plano
          .trim();

      await this.validarNumeroPlanoUnico(
        numeroPlano,
        id,
      );

      parque.numero_plano =
        numeroPlano;
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
              updateParqueDto
                .id_distrito,
          },
        });


      if (!distrito) {
        throw new NotFoundException(
          'No se encontró el distrito seleccionado.',
        );
      }


      parque.id_distrito =
        updateParqueDto
          .id_distrito;

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
              updateParqueDto
                .id_encargado,
          },
        });


      if (!encargado) {
        throw new NotFoundException(
          'No se encontró el encargado seleccionado.',
        );
      }


      parque.id_encargado =
        updateParqueDto
          .id_encargado;

      parque.encargado =
        encargado;
    }


    // ============================================
    // GUARDAR
    // ============================================

    let parqueGuardado:
      Parque;

    try {

      parqueGuardado =
        await this.parqueRepository.save(
          parque,
        );

    } catch (error: any) {

      this.manejarErrorDuplicado(
        error,
      );
    }


    // ============================================
    // DATOS NUEVOS
    // ============================================

    const datosNuevos =
      this.obtenerDatosAuditoria(
        parqueGuardado,
      );


    // ============================================
    // AUDITORÍA - EDITAR
    // ============================================

    await this.registrarAuditoria(
      usuario,

      'EDITAR',

      parqueGuardado.id_parque,

      `Se modificó el parque con finca ${parqueGuardado.numero_finca}.`,

      datosAnteriores,

      datosNuevos,
    );


    return parqueGuardado;
  }


  // ============================================
  // ELIMINAR PARQUE
  // ============================================

  async remove(
    id: number,

    usuario:
      UsuarioAuditoria,
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
          distrito:
            true,

          encargado:
            true,

          convenios:
            true,

          declaraciones:
            true,
        },
      });


    if (!parque) {
      throw new NotFoundException(
        'No se encontró el parque solicitado.',
      );
    }


    // ============================================
    // VALIDAR RELACIONES
    // ============================================

    const tieneConvenios =
      parque.convenios &&
      parque.convenios.length >
        0;

    const tieneDeclaraciones =
      parque.declaraciones &&
      parque.declaraciones.length >
        0;


    if (
      tieneConvenios &&
      tieneDeclaraciones
    ) {
      throw new ConflictException(
        'No se puede eliminar este parque porque tiene convenios y declaraciones asociados.',
      );
    }


    if (tieneConvenios) {
      throw new ConflictException(
        'No se puede eliminar este parque porque tiene uno o más convenios asociados.',
      );
    }


    if (tieneDeclaraciones) {
      throw new ConflictException(
        'No se puede eliminar este parque porque tiene una o más declaraciones asociadas.',
      );
    }


    // ============================================
    // GUARDAR DATOS PARA AUDITORÍA
    // ============================================

    const datosAnteriores =
      this.obtenerDatosAuditoria(
        parque,
      );

    const numeroFinca =
      parque.numero_finca;


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


    // ============================================
    // AUDITORÍA - ELIMINAR
    // ============================================

    await this.registrarAuditoria(
      usuario,

      'ELIMINAR',

      id,

      `Se eliminó el parque con finca ${numeroFinca}.`,

      datosAnteriores,

      null,
    );


    return {
      message:
        'Parque eliminado correctamente.',
    };
  }
}