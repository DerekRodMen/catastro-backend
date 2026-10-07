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

import {

  AuditoriaService,

} from '../auditoria/auditoria.service';

import type {

  UsuarioAuditoria,

} from '../auditoria/interfaces/usuario-auditoria.interface';

@Injectable()

export class DeclaracionService {

  constructor(

    @InjectRepository(Declaracion)

    private readonly declaracionRepository:

      Repository<Declaracion>,

    @InjectRepository(Parque)

    private readonly parqueRepository:

      Repository<Parque>,

    private readonly auditoriaService:

      AuditoriaService,

  ) {}

  // Convierte la fecha recibida en un objeto Date local.

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

  // Formatea una fecha al formato YYYY-MM-DD.

  private formatearFecha(

    fecha: Date,

  ): string {

    const anio =

      fecha.getFullYear();

    const mes =

      String(

        fecha.getMonth() + 1,

      ).padStart(

        2,

        '0',

      );

    const dia =

      String(

        fecha.getDate(),

      ).padStart(

        2,

        '0',

      );

    return `${anio}-${mes}-${dia}`;

  }

  // Calcula la fecha de vencimiento sumando 5 años.

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

  // Determina si la declaración está vigente o vencida.

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

  // Prepara los datos que se guardarán en auditoría.

  private obtenerDatosAuditoria(

    declaracion: Declaracion,

  ): Record<string, unknown> {

    return {

      id_declaracion:

        declaracion.id_declaracion,

      fecha_declaracion:

        this.formatearFecha(

          declaracion.fecha_declaracion,

        ),

      fecha_vencimiento:

        this.formatearFecha(

          declaracion.fecha_vencimiento,

        ),

      estado_declaracion:

        declaracion.estado_declaracion,

      id_parque:

        declaracion.id_parque,

      parque:

        declaracion.parque

          ?.ubicacion ??

        null,

    };

  }

  // Registra las acciones realizadas en auditoría.

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

          'DECLARACIONES',

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

      console.error(

        'Error registrando auditoría de declaraciones:',

        error,

      );

    }

  }

  // ================================

  // CREAR DECLARACIÓN

  // ================================

  async create(

    createDeclaracionDto:

      CreateDeclaracionDto,

    usuario: UsuarioAuditoria,

  ): Promise<Declaracion> {

    // Busca el parque seleccionado.

    const parque =
      await this.parqueRepository.findOne({

        where: {

          id_parque:

            createDeclaracionDto.id_parque,

        },

      });

    // Valida que el parque exista.

    if (!parque) {

      throw new NotFoundException(

        'No se encontró el parque seleccionado.',

      );

    }

    // Convierte la fecha enviada desde el formulario.

    const fechaDeclaracion =
      this.crearFechaLocal(

        createDeclaracionDto

          .fecha_declaracion,

      );

    // Calcula automáticamente la fecha de vencimiento.

    const fechaVencimiento =
      this.calcularFechaVencimiento(

        fechaDeclaracion,

      );

    // Calcula automáticamente el estado inicial.

    const estadoCalculado =
      this.calcularEstadoDeclaracion(

        fechaVencimiento,

      );

    // Crea la nueva declaración.

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

    // Guarda la declaración en la base de datos.

    const guardada =
      await this.declaracionRepository.save(

        declaracion,

      );

    // Registra la operación en auditoría.

    await this.registrarAuditoria(
      usuario,

      'CREAR',

      guardada.id_declaracion,

      `Se creó una declaración para el parque "${parque.ubicacion}".`,

      null,

      this.obtenerDatosAuditoria(

        guardada,

      ),

    );

    return guardada;

  }

  // ================================

  // LISTAR DECLARACIONES

  // ================================

  async findAll():

    Promise<Declaracion[]> {

    // Obtiene todas las declaraciones junto con su parque.

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

    // Revisa cada declaración y actualiza su estado si es necesario.

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

  // ================================

  // BUSCAR DECLARACIÓN POR ID

  // ================================

  async findOne(

    id: number,

  ): Promise<Declaracion> {

    // Busca la declaración por su ID.

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

  // ================================

  // ACTUALIZAR DECLARACIÓN

  // ================================

  async update(

    id: number,

    updateDeclaracionDto:

      UpdateDeclaracionDto,

    usuario: UsuarioAuditoria,

  ): Promise<Declaracion> {

    // Busca la declaración que se desea modificar.

    const declaracion =
      await this.findOne(id);

    // Guarda los datos anteriores para auditoría.

    const datosAnteriores =
      this.obtenerDatosAuditoria(

        declaracion,

      );

    // Actualiza los campos enviados en el DTO.

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

    // Guarda los cambios en la base de datos.

    const guardada =
      await this.declaracionRepository.save(

        declaracion,

      );

    // Registra la modificación en auditoría.

    await this.registrarAuditoria(
      usuario,

      'EDITAR',

      guardada.id_declaracion,

      `Se modificó la declaración del parque "${guardada.parque?.ubicacion ?? guardada.id_parque}".`,

      datosAnteriores,

      this.obtenerDatosAuditoria(

        guardada,

      ),

    );

    return guardada;

  }

  // ================================

  // ELIMINAR DECLARACIÓN

  // ================================

  async remove(

    id: number,

    usuario: UsuarioAuditoria,

  ): Promise<{

    message: string;

  }> {

    // Busca la declaración antes de eliminarla.

    const declaracion =
      await this.findOne(id);

    // Guarda los datos anteriores para auditoría.

    const datosAnteriores =
      this.obtenerDatosAuditoria(

        declaracion,

      );

    const idDeclaracion =

      declaracion.id_declaracion;

    const nombreParque =

      declaracion.parque

        ?.ubicacion ??

      String(

        declaracion.id_parque,

      );

    // Elimina la declaración de la base de datos.

    await this.declaracionRepository.remove(
      declaracion,

    );

    // Registra la eliminación en auditoría.

    await this.registrarAuditoria(
      usuario,

      'ELIMINAR',

      idDeclaracion,

      `Se eliminó la declaración del parque "${nombreParque}".`,

      datosAnteriores,

      null,

    );

    return {

      message:

        'Declaración eliminada correctamente.',

    };

  }

}
