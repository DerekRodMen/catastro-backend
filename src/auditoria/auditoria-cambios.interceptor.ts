import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import {
  DataSource,
} from 'typeorm';

import {
  Observable,
} from 'rxjs';

import {
  mergeMap,
} from 'rxjs/operators';

import {
  AuditoriaService,
} from './auditoria.service';


interface ConfiguracionModulo {
  modulo: string;
  tabla: string;
  idColumna: string;
  nombreSingular: string;
}


interface EventoAuditoria {
  accion:
    | 'CREAR'
    | 'EDITAR'
    | 'ELIMINAR';

  idRegistro:
    | number
    | null;

  descripcion: string;

  idImagen?:
    number;
}


interface UsuarioAuditoriaDetectado {
  id_usuario:
    number | null;

  nombre_usuario:
    string | null;

  correo:
    string | null;
}


const MODULOS:
  Record<
    string,
    ConfiguracionModulo
  > = {

  distritos: {
    modulo:
      'DISTRITOS',

    tabla:
      'DISTRITO',

    idColumna:
      'id_distrito',

    nombreSingular:
      'distrito',
  },

  encargados: {
    modulo:
      'ENCARGADOS',

    tabla:
      'ENCARGADO',

    idColumna:
      'id_encargado',

    nombreSingular:
      'encargado',
  },

  convenios: {
    modulo:
      'CONVENIOS',

    tabla:
      'CONVENIO',

    idColumna:
      'id_convenio',

    nombreSingular:
      'convenio',
  },

  declaraciones: {
    modulo:
      'DECLARACIONES',

    tabla:
      'DECLARACION',

    idColumna:
      'id_declaracion',

    nombreSingular:
      'declaración',
  },

  mantenimientos: {
    modulo:
      'MANTENIMIENTOS',

    tabla:
      'MANTENIMIENTO',

    idColumna:
      'id_mantenimiento',

    nombreSingular:
      'mantenimiento',
  },

  usuarios: {
    modulo:
      'USUARIOS',

    tabla:
      'USUARIO',

    idColumna:
      'id_usuario',

    nombreSingular:
      'usuario',
  },
};


@Injectable()
export class AuditoriaCambiosInterceptor
  implements NestInterceptor {

  constructor(
    private readonly auditoriaService:
      AuditoriaService,

    private readonly dataSource:
      DataSource,
  ) {}


  async intercept(
    context:
      ExecutionContext,

    next:
      CallHandler,
  ): Promise<
    Observable<unknown>
  > {

    const request =
      context
        .switchToHttp()
        .getRequest();

    const metodo =
      String(
        request.method ??
          '',
      )
        .trim()
        .toUpperCase();


    if (
      ![
        'POST',
        'PATCH',
        'DELETE',
      ].includes(
        metodo,
      )
    ) {

      return next.handle();
    }


    const segmentos =
      this.obtenerSegmentos(
        request,
      );


    const recurso =
      segmentos[0]
        ?.trim()
        .toLowerCase();


    if (
      !recurso
    ) {

      return next.handle();
    }


    /*
     * PARQUES YA TIENE AUDITORÍA PROPIA.
     *
     * Se excluye aquí para evitar
     * duplicar los movimientos.
     */
    if (
      recurso ===
      'parques'
    ) {

      return next.handle();
    }


    const configuracion =
      MODULOS[
        recurso
      ];


    if (
      !configuracion
    ) {

      return next.handle();
    }


    const evento =
      this.resolverEvento(
        metodo,
        segmentos,
        configuracion,
      );


    if (
      !evento
    ) {

      return next.handle();
    }


    console.log(
      `[AUDITORIA CENTRAL] Detectado ${configuracion.modulo} - ${evento.accion}`,
    );


    let datosAnteriores:
      Record<
        string,
        unknown
      > |
      null =
      null;


    try {

      if (
        evento.idImagen !==
        undefined
      ) {

        datosAnteriores =
          await this.leerRegistro(
            'MANTENIMIENTO_IMAGEN',
            'id_imagen',
            evento.idImagen,
          );

      } else if (
        evento.idRegistro !==
          null &&
        evento.accion !==
          'CREAR'
      ) {

        datosAnteriores =
          await this.leerRegistro(
            configuracion.tabla,
            configuracion.idColumna,
            evento.idRegistro,
          );
      }

    } catch (
      error
    ) {

      console.error(
        `[AUDITORIA CENTRAL] No se pudieron leer datos anteriores de ${configuracion.modulo}:`,
        error,
      );
    }


    return next
      .handle()
      .pipe(

        mergeMap(
          async (
            respuesta,
          ) => {

            try {

              await this.registrarCambio(
                request,
                configuracion,
                evento,
                datosAnteriores,
                respuesta,
              );

            } catch (
              error
            ) {

              /*
               * La auditoría NUNCA debe
               * hacer fallar la operación
               * principal del sistema.
               */
              console.error(
                `[AUDITORIA CENTRAL] Error registrando ${configuracion.modulo}:`,
                error,
              );
            }


            return respuesta;
          },
        ),
      );
  }


  // =====================================================
  // REGISTRAR CAMBIO
  // =====================================================

  private async registrarCambio(
    request:
      any,

    configuracion:
      ConfiguracionModulo,

    evento:
      EventoAuditoria,

    datosAnteriores:
      Record<
        string,
        unknown
      > |
      null,

    respuesta:
      unknown,
  ): Promise<void> {

    let idRegistro =
      evento.idRegistro;


    let datosNuevos:
      Record<
        string,
        unknown
      > |
      null =
      null;


    // ============================================
    // CREAR
    // ============================================

    if (
      evento.accion ===
      'CREAR'
    ) {

      const idRespuesta =
        this.extraerIdRespuesta(
          respuesta,
          configuracion.idColumna,
        );


      if (
        idRespuesta !==
        null
      ) {

        idRegistro =
          idRespuesta;


        datosNuevos =
          await this.leerRegistro(
            configuracion.tabla,
            configuracion.idColumna,
            idRespuesta,
          );
      }


      /*
       * Invitación de usuario:
       * el endpoint puede devolver solamente
       * un mensaje, así que buscamos el usuario
       * recién creado usando el correo.
       */
      if (
        configuracion.modulo ===
          'USUARIOS' &&
        idRegistro ===
          null
      ) {

        const correo =
          typeof request.body
            ?.correo ===
          'string'
            ? request.body.correo
                .trim()
                .toLowerCase()
            : '';


        if (
          correo
        ) {

          const usuarioCreado =
            await this.buscarUsuarioPorCorreo(
              correo,
            );


          if (
            usuarioCreado
          ) {

            idRegistro =
              this.numeroValido(
                usuarioCreado.id_usuario,
              );


            datosNuevos =
              this.convertirARegistro(
                this.sanitizarValor(
                  usuarioCreado,
                ),
              );
          }
        }
      }


      if (
        !datosNuevos
      ) {

        datosNuevos =
          this.convertirARegistro(
            this.sanitizarValor(
              request.body,
            ),
          );
      }
    }


    // ============================================
    // EDITAR
    // ============================================

    if (
      evento.accion ===
        'EDITAR' &&
      evento.idImagen ===
        undefined &&
      idRegistro !==
        null
    ) {

      datosNuevos =
        await this.leerRegistro(
          configuracion.tabla,
          configuracion.idColumna,
          idRegistro,
        );
    }


    // ============================================
    // ELIMINACIÓN DE IMAGEN
    // ============================================

    if (
      evento.idImagen !==
      undefined
    ) {

      datosNuevos = {
        id_mantenimiento:
          idRegistro,

        id_imagen_eliminada:
          evento.idImagen,

        estado:
          'Imagen eliminada',
      };
    }


    // ============================================
    // ELIMINAR
    // ============================================

    if (
      evento.accion ===
      'ELIMINAR'
    ) {

      datosNuevos =
        null;
    }


    const usuario =
      this.obtenerUsuario(
        request,
      );


    /*
     * Evita duplicados si alguno de
     * los services ya alcanzó a registrar
     * la misma operación.
     */
    const duplicado =
      await this.existeRegistroReciente(
        configuracion.modulo,
        evento.accion,
        idRegistro,
      );


    if (
      duplicado
    ) {

      console.log(
        `[AUDITORIA CENTRAL] Se omitió duplicado ${configuracion.modulo} - ${evento.accion}`,
      );

      return;
    }


    await this.auditoriaService.registrar({

      id_usuario:
        usuario.id_usuario,

      nombre_usuario:
        usuario.nombre_usuario,

      correo_usuario:
        usuario.correo,

      modulo:
        configuracion.modulo,

      accion:
        evento.accion,

      id_registro:
        idRegistro,

      descripcion:
        evento.descripcion,

      datos_anteriores:
        datosAnteriores,

      datos_nuevos:
        datosNuevos,
    });


    console.log(
      `[AUDITORIA CENTRAL] Registrado ${configuracion.modulo} - ${evento.accion}`,
    );
  }


  // =====================================================
  // RESOLVER EVENTO
  // =====================================================

  private resolverEvento(
    metodo:
      string,

    segmentos:
      string[],

    configuracion:
      ConfiguracionModulo,
  ): EventoAuditoria | null {

    const recurso =
      segmentos[0]
        ?.trim()
        .toLowerCase();


    const segundo =
      segmentos[1];


    const tercero =
      segmentos[2]
        ?.trim()
        .toLowerCase();


    const id =
      this.numeroValido(
        segundo,
      );


    // ============================================
    // USUARIOS
    // ============================================

    if (
      recurso ===
      'usuarios'
    ) {

      if (
        metodo ===
          'POST' &&
        segundo
          ?.trim()
          .toLowerCase() ===
          'invitar'
      ) {

        return {
          accion:
            'CREAR',

          idRegistro:
            null,

          descripcion:
            'Se invitó a un nuevo usuario.',
        };
      }


      if (
        metodo ===
          'POST' &&
        id !==
          null &&
        [
          'solicitar-cambio-correo',
          'verificar-cambio-correo',
          'reenviar-codigo-correo',
        ].includes(
          tercero ??
            '',
        )
      ) {

        let descripcion =
          'Se modificó información de un usuario.';


        if (
          tercero ===
          'solicitar-cambio-correo'
        ) {

          descripcion =
            'Se solicitó un cambio de correo de usuario.';

        } else if (
          tercero ===
          'verificar-cambio-correo'
        ) {

          descripcion =
            'Se confirmó un cambio de correo de usuario.';

        } else if (
          tercero ===
          'reenviar-codigo-correo'
        ) {

          descripcion =
            'Se reenvió el código para cambio de correo de usuario.';
        }


        return {
          accion:
            'EDITAR',

          idRegistro:
            id,

          descripcion,
        };
      }


      if (
        metodo ===
          'PATCH' &&
        id !==
          null
      ) {

        return {
          accion:
            'EDITAR',

          idRegistro:
            id,

          descripcion:
            'Se modificó un usuario.',
        };
      }


      if (
        metodo ===
          'DELETE' &&
        id !==
          null
      ) {

        return {
          accion:
            'ELIMINAR',

          idRegistro:
            id,

          descripcion:
            'Se eliminó un usuario.',
        };
      }


      return null;
    }


    // ============================================
    // CREAR
    // ============================================

    if (
      metodo ===
        'POST' &&
      segmentos.length ===
        1
    ) {

      return {
        accion:
          'CREAR',

        idRegistro:
          null,

        descripcion:
          `Se creó un ${configuracion.nombreSingular}.`,
      };
    }


    // ============================================
    // EDITAR
    // ============================================

    if (
      metodo ===
        'PATCH' &&
      id !==
        null
    ) {

      return {
        accion:
          'EDITAR',

        idRegistro:
          id,

        descripcion:
          `Se modificó un ${configuracion.nombreSingular}.`,
      };
    }


    // ============================================
    // ELIMINAR IMAGEN DE MANTENIMIENTO
    // ============================================

    if (
      recurso ===
        'mantenimientos' &&
      metodo ===
        'DELETE' &&
      id !==
        null &&
      tercero ===
        'imagenes'
    ) {

      const idImagen =
        this.numeroValido(
          segmentos[3],
        );


      if (
        idImagen ===
        null
      ) {

        return null;
      }


      return {
        accion:
          'EDITAR',

        idRegistro:
          id,

        idImagen,

        descripcion:
          'Se eliminó una imagen de respaldo de un mantenimiento.',
      };
    }


    // ============================================
    // ELIMINAR
    // ============================================

    if (
      metodo ===
        'DELETE' &&
      id !==
        null
    ) {

      return {
        accion:
          'ELIMINAR',

        idRegistro:
          id,

        descripcion:
          `Se eliminó un ${configuracion.nombreSingular}.`,
      };
    }


    return null;
  }


  // =====================================================
  // RUTA
  // =====================================================

  private obtenerSegmentos(
    request:
      any,
  ): string[] {

    const url =
      String(
        request.originalUrl ??
          request.url ??
          '',
      )
        .split('?')[0]
        .replace(
          /^\/api(?=\/|$)/i,
          '',
        );


    return url
      .split('/')
      .filter(
        Boolean,
      )
      .map(
        (
          segmento,
        ) =>
          decodeURIComponent(
            segmento,
          ),
      );
  }


  // =====================================================
  // LEER REGISTRO
  // =====================================================

  private async leerRegistro(
    tabla:
      string,

    idColumna:
      string,

    id:
      number,
  ): Promise<
    Record<
      string,
      unknown
    > |
    null
  > {

    if (
      !Number.isInteger(
        id,
      )
    ) {

      return null;
    }


    const sql =
      `SELECT TOP (1) * ` +
      `FROM [${tabla}] ` +
      `WHERE [${idColumna}] = ${id}`;


    const resultado =
      await this.dataSource.query(
        sql,
      );


    if (
      !Array.isArray(
        resultado,
      ) ||
      !resultado[0]
    ) {

      return null;
    }


    return this.convertirARegistro(
      this.sanitizarValor(
        resultado[0],
      ),
    );
  }


  // =====================================================
  // BUSCAR USUARIO POR CORREO
  // =====================================================

  private async buscarUsuarioPorCorreo(
    correo:
      string,
  ): Promise<
    Record<
      string,
      unknown
    > |
    null
  > {

    const correoSeguro =
      correo.replace(
        /'/g,
        "''",
      );


    const resultado =
      await this.dataSource.query(
        `SELECT TOP (1) * FROM [USUARIO] WHERE LOWER([correo]) = LOWER('${correoSeguro}') ORDER BY [id_usuario] DESC`,
      );


    if (
      !Array.isArray(
        resultado,
      ) ||
      !resultado[0]
    ) {

      return null;
    }


    return resultado[0] as
      Record<
        string,
        unknown
      >;
  }


  // =====================================================
  // EVITAR DUPLICADOS
  // =====================================================

  private async existeRegistroReciente(
    modulo:
      string,

    accion:
      string,

    idRegistro:
      number |
      null,
  ): Promise<boolean> {

    /*
     * módulo y acción vienen únicamente
     * de constantes internas.
     */

    const condicionId =
      idRegistro ===
      null
        ? '[id_registro] IS NULL'
        : `[id_registro] = ${idRegistro}`;


    const resultado =
      await this.dataSource.query(
        `
          SELECT TOP (1)
            [id_auditoria]
          FROM [AUDITORIA]
          WHERE
            [modulo] = '${modulo}'
            AND [accion] = '${accion}'
            AND ${condicionId}
            AND [fecha_hora] >= DATEADD(SECOND, -5, SYSDATETIME())
          ORDER BY [id_auditoria] DESC
        `,
      );


    return (
      Array.isArray(
        resultado,
      ) &&
      resultado.length >
        0
    );
  }


  // =====================================================
  // USUARIO
  // =====================================================

  private obtenerUsuario(
    request:
      any,
  ): UsuarioAuditoriaDetectado {

    const directo =
      request.user;


    if (
      directo &&
      typeof directo ===
        'object'
    ) {

      return {
        id_usuario:
          this.numeroValido(
            directo.id_usuario ??
              directo.sub,
          ),

        nombre_usuario:
          typeof directo.nombre_usuario ===
            'string'
            ? directo.nombre_usuario
            : null,

        correo:
          typeof directo.correo ===
            'string'
            ? directo.correo
            : null,
      };
    }


    /*
     * Algunos controladores actuales no tienen
     * JwtAuthGuard. En esos casos el navegador
     * igualmente envía Authorization.
     *
     * Solo decodificamos el payload para obtener
     * datos descriptivos de auditoría.
     * Esto NO se usa como autorización.
     */
    try {

      const authorization =
        String(
          request.headers
            ?.authorization ??
            '',
        );


      if (
        !authorization
          .toLowerCase()
          .startsWith(
            'bearer ',
          )
      ) {

        return {
          id_usuario:
            null,

          nombre_usuario:
            null,

          correo:
            null,
        };
      }


      const token =
        authorization
          .slice(
            7,
          )
          .trim();


      const partes =
        token.split(
          '.',
        );


      if (
        partes.length <
        2
      ) {

        throw new Error(
          'JWT inválido',
        );
      }


      const payloadTexto =
        Buffer
          .from(
            partes[1],
            'base64url',
          )
          .toString(
            'utf8',
          );


      const payload =
        JSON.parse(
          payloadTexto,
        );


      return {
        id_usuario:
          this.numeroValido(
            payload.id_usuario ??
              payload.sub,
          ),

        nombre_usuario:
          typeof payload.nombre_usuario ===
            'string'
            ? payload.nombre_usuario
            : null,

        correo:
          typeof payload.correo ===
            'string'
            ? payload.correo
            : null,
      };

    } catch {

      return {
        id_usuario:
          null,

        nombre_usuario:
          null,

        correo:
          null,
      };
    }
  }


  // =====================================================
  // EXTRAER ID DE RESPUESTA
  // =====================================================

  private extraerIdRespuesta(
    respuesta:
      unknown,

    idColumna:
      string,
  ): number | null {

    if (
      !respuesta ||
      typeof respuesta !==
        'object'
    ) {

      return null;
    }


    const objeto =
      respuesta as
        Record<
          string,
          unknown
        >;


    return this.numeroValido(
      objeto[
        idColumna
      ],
    );
  }


  // =====================================================
  // DATOS SENSIBLES
  // =====================================================

  private sanitizarValor(
    valor:
      unknown,

    visitados:
      WeakSet<object> =
      new WeakSet<object>(),
  ): unknown {

    if (
      valor ===
        null ||
      valor ===
        undefined
    ) {

      return valor;
    }


    if (
      valor instanceof
      Date
    ) {

      return valor.toISOString();
    }


    if (
      Buffer.isBuffer(
        valor,
      )
    ) {

      return '[ARCHIVO_BINARIO_NO_REGISTRADO]';
    }


    if (
      Array.isArray(
        valor,
      )
    ) {

      return valor.map(
        (
          item,
        ) =>
          this.sanitizarValor(
            item,
            visitados,
          ),
      );
    }


    if (
      typeof valor ===
      'object'
    ) {

      const objeto =
        valor as
          Record<
            string,
            unknown
          >;


      if (
        visitados.has(
          objeto,
        )
      ) {

        return '[REFERENCIA_CIRCULAR]';
      }


      visitados.add(
        objeto,
      );


      const resultado:
        Record<
          string,
          unknown
        > =
        {};


      for (
        const [
          clave,
          contenido,
        ] of Object.entries(
          objeto,
        )
      ) {

        if (
          this.esCampoSensible(
            clave,
          )
        ) {

          continue;
        }


        resultado[
          clave
        ] =
          this.sanitizarValor(
            contenido,
            visitados,
          );
      }


      return resultado;
    }


    return valor;
  }


  private esCampoSensible(
    clave:
      string,
  ): boolean {

    const normalizada =
      clave
        .toLowerCase()
        .normalize(
          'NFD',
        )
        .replace(
          /[\u0300-\u036f]/g,
          '',
        );


    return [
      'password',
      'contrasena',
      'token',
      'hash',
      'codigo',
      'secret',
      'jwt',
    ].some(
      (
        palabra,
      ) =>
        normalizada.includes(
          palabra,
        ),
    );
  }


  // =====================================================
  // UTILIDADES
  // =====================================================

  private numeroValido(
    valor:
      unknown,
  ): number | null {

    if (
      valor ===
        null ||
      valor ===
        undefined ||
      valor ===
        ''
    ) {

      return null;
    }


    const numero =
      Number(
        valor,
      );


    if (
      !Number.isInteger(
        numero,
      )
    ) {

      return null;
    }


    return numero;
  }


  private convertirARegistro(
    valor:
      unknown,
  ): Record<
    string,
    unknown
  > | null {

    if (
      !valor ||
      typeof valor !==
        'object' ||
      Array.isArray(
        valor,
      )
    ) {

      return null;
    }


    return valor as
      Record<
        string,
        unknown
      >;
  }
}
