import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import * as ExcelJS from 'exceljs';

import {
  Parque,
} from '../parque/entities/parque.entity';

import {
  Mantenimiento,
} from '../mantenimiento/entities/mantenimiento.entity';


// ============================================
// FILTROS
// ============================================

export interface FiltrosListadoParques {
  id_distrito?: string;

  id_encargado?: string;

  estado?: string;

  visado?: string;

  estado_convenio?: string;

  busqueda?: string;
}


// ============================================
// RESULTADO
// ============================================

export interface ResultadoListadoParque {
  id_parque: number;

  distrito: {
    id_distrito: number;

    nombre_distrito: string;

    numero_distrito: number;
  } | null;

  ubicacion: string;

  numero_finca: string;

  area: number;

  numero_plano: string;

  visado: string;

  estado: string;

  encargado: {
    id_encargado: number;

    entidad_encargada: string;

    cedula_juridica: string | null;

    representante_legal: string;

    correo_encargado: string;

    telefono_encargado: string;
  } | null;

  convenios: Array<{
    id_convenio: number;

    numero_convenio: string | null;

    fecha_firma: Date;

    plazo: number;

    fecha_renovacion_firmas: Date;

    estado_convenio: string;
  }>;

  declaraciones: Array<{
    id_declaracion: number;

    fecha_declaracion: Date;

    fecha_vencimiento: Date;

    estado_declaracion: string;
  }>;

  inversion: {
    total: number;

    cantidad_mantenimientos: number;

    mantenimientos: Array<{
      id_mantenimiento: number;

      nombre_mantenimiento: string;

      descripcion: string;

      inversion: number;

      descripcion_inversion: string | null;

      fecha_mantenimiento: string;
    }>;
  };
}


@Injectable()
export class ListadoParquesService {
  constructor(
    @InjectRepository(Parque)
    private readonly parqueRepository:
      Repository<Parque>,

    @InjectRepository(Mantenimiento)
    private readonly mantenimientoRepository:
      Repository<Mantenimiento>,
  ) {}


  // ============================================
  // NORMALIZAR TEXTO
  // ============================================

  private normalizarTexto(
    valor: unknown,
  ): string {
    return String(
      valor ?? '',
    )
      .trim()
      .toLowerCase();
  }


  // ============================================
  // CONVERTIR ID
  // ============================================

  private convertirId(
    valor?: string,
  ): number | null {
    if (
      valor === undefined ||
      valor === null ||
      valor.trim() === ''
    ) {
      return null;
    }

    const numero =
      Number(valor);

    if (
      !Number.isInteger(numero) ||
      numero <= 0
    ) {
      return null;
    }

    return numero;
  }


  // ============================================
  // FORMATEAR FECHA
  // ============================================

  private formatearFecha(
    fecha:
      | Date
      | string
      | null
      | undefined,
  ): string {
    if (!fecha) {
      return '-';
    }

    let fechaNormalizada:
      Date;

    if (
      fecha instanceof Date
    ) {
      fechaNormalizada =
        new Date(
          Date.UTC(
            fecha.getUTCFullYear(),
            fecha.getUTCMonth(),
            fecha.getUTCDate(),
          ),
        );
    } else {
      const partes =
        String(fecha)
          .substring(
            0,
            10,
          )
          .split('-');

      if (
        partes.length !== 3
      ) {
        return String(
          fecha,
        );
      }

      fechaNormalizada =
        new Date(
          Date.UTC(
            Number(
              partes[0],
            ),
            Number(
              partes[1],
            ) - 1,
            Number(
              partes[2],
            ),
          ),
        );
    }

    if (
      Number.isNaN(
        fechaNormalizada.getTime(),
      )
    ) {
      return '-';
    }

    const meses = [
      'ENERO',
      'FEBRERO',
      'MARZO',
      'ABRIL',
      'MAYO',
      'JUNIO',
      'JULIO',
      'AGOSTO',
      'SETIEMBRE',
      'OCTUBRE',
      'NOVIEMBRE',
      'DICIEMBRE',
    ];

    const dia =
      String(
        fechaNormalizada.getUTCDate(),
      ).padStart(
        2,
        '0',
      );

    const mes =
      meses[
        fechaNormalizada.getUTCMonth()
      ];

    const anio =
      fechaNormalizada.getUTCFullYear();

    return `${dia} DE ${mes} ${anio}`;
  }


  // ============================================
  // FORMATEAR DISTRITO
  // ============================================

  private formatearDistrito(
    numero:
      number | null | undefined,

    nombre:
      string | null | undefined,
  ): string {
    const numeroTexto =
      String(
        numero ?? '',
      ).padStart(
        2,
        '0',
      );

    const nombreTexto =
      String(
        nombre ?? '',
      )
        .trim()
        .toUpperCase();

    return `${numeroTexto}-${nombreTexto}`;
  }


  // ============================================
  // LISTAR PARQUES
  // ============================================

  async listar(
    filtros:
      FiltrosListadoParques,
  ): Promise<
    ResultadoListadoParque[]
  > {
    const query =
      this.parqueRepository
        .createQueryBuilder(
          'parque',
        )

        .leftJoinAndSelect(
          'parque.distrito',
          'distrito',
        )

        .leftJoinAndSelect(
          'parque.encargado',
          'encargado',
        )

        .leftJoinAndSelect(
          'parque.convenios',
          'convenio',
        )

        .leftJoinAndSelect(
          'parque.declaraciones',
          'declaracion',
        )

        .distinct(
          true,
        );


    // ============================================
    // DISTRITO
    // ============================================

    const idDistrito =
      this.convertirId(
        filtros.id_distrito,
      );

    if (
      idDistrito !== null
    ) {
      query.andWhere(
        'parque.id_distrito = :idDistrito',
        {
          idDistrito,
        },
      );
    }


    // ============================================
    // ENCARGADO
    // ============================================

    const idEncargado =
      this.convertirId(
        filtros.id_encargado,
      );

    if (
      idEncargado !== null
    ) {
      query.andWhere(
        'parque.id_encargado = :idEncargado',
        {
          idEncargado,
        },
      );
    }


    // ============================================
    // ESTADO DEL PARQUE
    // ============================================

    if (
      filtros.estado &&
      filtros.estado.trim() !== ''
    ) {
      query.andWhere(
        'LOWER(parque.estado) = LOWER(:estado)',
        {
          estado:
            filtros.estado.trim(),
        },
      );
    }


    // ============================================
    // VISADO
    // ============================================

    if (
      filtros.visado &&
      filtros.visado.trim() !== ''
    ) {
      query.andWhere(
        'LOWER(parque.visado) = LOWER(:visado)',
        {
          visado:
            filtros.visado.trim(),
        },
      );
    }


    // ============================================
    // ESTADO DEL CONVENIO
    // ============================================

    if (
      filtros.estado_convenio &&
      filtros.estado_convenio.trim() !== ''
    ) {
      query.andWhere(
        `
        EXISTS (
          SELECT 1
          FROM CONVENIO convenioFiltro
          WHERE convenioFiltro.id_parque = parque.id_parque
          AND LOWER(convenioFiltro.estado_convenio)
              = LOWER(:estadoConvenio)
        )
        `,
        {
          estadoConvenio:
            filtros
              .estado_convenio
              .trim(),
        },
      );
    }


    // ============================================
    // BÚSQUEDA GENERAL
    // ============================================

    if (
      filtros.busqueda &&
      filtros.busqueda.trim() !== ''
    ) {
      const busqueda =
        `%${filtros.busqueda.trim()}%`;

      query.andWhere(
        `
        (
          parque.ubicacion LIKE :busqueda
          OR parque.numero_finca LIKE :busqueda
          OR parque.numero_plano LIKE :busqueda
          OR distrito.nombre_distrito LIKE :busqueda
          OR encargado.entidad_encargada LIKE :busqueda
        )
        `,
        {
          busqueda,
        },
      );
    }


    // ============================================
    // ORDEN
    // ============================================

    query
      .orderBy(
        'distrito.numero_distrito',
        'ASC',
      )

      .addOrderBy(
        'parque.ubicacion',
        'ASC',
      )

      .addOrderBy(
        'convenio.fecha_firma',
        'ASC',
      )

      .addOrderBy(
        'declaracion.fecha_declaracion',
        'ASC',
      );


    const parques =
      await query.getMany();


    // ============================================
    // MANTENIMIENTOS
    // ============================================

    const idsParques =
      parques.map(
        (parque) =>
          parque.id_parque,
      );

    let mantenimientos:
      Mantenimiento[] = [];

    if (
      idsParques.length > 0
    ) {
      mantenimientos =
        await this
          .mantenimientoRepository
          .createQueryBuilder(
            'mantenimiento',
          )

          .where(
            `
            mantenimiento.id_parque
            IN (:...idsParques)
            `,
            {
              idsParques,
            },
          )

          .orderBy(
            'mantenimiento.fecha_mantenimiento',
            'ASC',
          )

          .getMany();
    }


    // ============================================
    // AGRUPAR MANTENIMIENTOS
    // ============================================

    const mantenimientosPorParque =
      new Map<
        number,
        Mantenimiento[]
      >();

    for (
      const mantenimiento
      of mantenimientos
    ) {
      const actuales =
        mantenimientosPorParque.get(
          mantenimiento.id_parque,
        ) ?? [];

      actuales.push(
        mantenimiento,
      );

      mantenimientosPorParque.set(
        mantenimiento.id_parque,
        actuales,
      );
    }


    // ============================================
    // RESULTADO
    // ============================================

    return parques.map(
      (
        parque,
      ): ResultadoListadoParque => {
        const mantenimientosParque =
          mantenimientosPorParque.get(
            parque.id_parque,
          ) ?? [];

        const inversiones =
          mantenimientosParque.filter(
            (
              mantenimiento,
            ) => {
              const monto =
                Number(
                  mantenimiento.inversion ??
                    0,
                );

              const descripcion =
                this.normalizarTexto(
                  mantenimiento
                    .descripcion_inversion,
                );

              return (
                monto > 0 ||
                descripcion !== ''
              );
            },
          );

        const totalInversion =
          inversiones.reduce(
            (
              acumulado,
              mantenimiento,
            ) => {
              return (
                acumulado +
                Number(
                  mantenimiento.inversion ??
                    0,
                )
              );
            },
            0,
          );

        return {
          id_parque:
            parque.id_parque,

          distrito:
            parque.distrito
              ? {
                  id_distrito:
                    parque.distrito
                      .id_distrito,

                  nombre_distrito:
                    parque.distrito
                      .nombre_distrito,

                  numero_distrito:
                    parque.distrito
                      .numero_distrito,
                }
              : null,

          ubicacion:
            parque.ubicacion,

          numero_finca:
            parque.numero_finca,

          area:
            Number(
              parque.area,
            ),

          numero_plano:
            parque.numero_plano,

          visado:
            parque.visado,

          estado:
            parque.estado,

          encargado:
            parque.encargado
              ? {
                  id_encargado:
                    parque.encargado
                      .id_encargado,

                  entidad_encargada:
                    parque.encargado
                      .entidad_encargada,

                  cedula_juridica:
                    parque.encargado
                      .cedula_juridica,

                  representante_legal:
                    parque.encargado
                      .representante_legal,

                  correo_encargado:
                    parque.encargado
                      .correo_encargado,

                  telefono_encargado:
                    parque.encargado
                      .telefono_encargado,
                }
              : null,

          convenios:
            (
              parque.convenios ??
              []
            ).map(
              (
                convenio,
              ) => ({
                id_convenio:
                  convenio.id_convenio,

                numero_convenio:
                  convenio.numero_convenio,

                fecha_firma:
                  convenio.fecha_firma,

                plazo:
                  convenio.plazo,

                fecha_renovacion_firmas:
                  convenio
                    .fecha_renovacion_firmas,

                estado_convenio:
                  convenio.estado_convenio,
              }),
            ),

          declaraciones:
            (
              parque.declaraciones ??
              []
            ).map(
              (
                declaracion,
              ) => ({
                id_declaracion:
                  declaracion.id_declaracion,

                fecha_declaracion:
                  declaracion
                    .fecha_declaracion,

                fecha_vencimiento:
                  declaracion
                    .fecha_vencimiento,

                estado_declaracion:
                  declaracion
                    .estado_declaracion,
              }),
            ),

          inversion: {
            total:
              Number(
                totalInversion.toFixed(
                  2,
                ),
              ),

            cantidad_mantenimientos:
              inversiones.length,

            mantenimientos:
              inversiones.map(
                (
                  mantenimiento,
                ) => ({
                  id_mantenimiento:
                    mantenimiento
                      .id_mantenimiento,

                  nombre_mantenimiento:
                    mantenimiento
                      .nombre_mantenimiento,

                  descripcion:
                    mantenimiento
                      .descripcion,

                  inversion:
                    Number(
                      mantenimiento
                        .inversion ??
                        0,
                    ),

                  descripcion_inversion:
                    mantenimiento
                      .descripcion_inversion,

                  fecha_mantenimiento:
                    mantenimiento
                      .fecha_mantenimiento,
                }),
              ),
          },
        };
      },
    );
  }


  // ============================================
  // GENERAR EXCEL
  // ============================================

  async generarExcel(
    filtros:
      FiltrosListadoParques,
  ): Promise<Buffer> {
    const parques =
      await this.listar(
        filtros,
      );

    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      'Municipalidad de Grecia';

    workbook.lastModifiedBy =
      'Sistema de Catastro';

    workbook.created =
      new Date();

    workbook.modified =
      new Date();


    // ============================================
    // HOJA
    // ============================================

    const hoja =
      workbook.addWorksheet(
        'FINCAS MUNI',
        {
          properties: {
            defaultRowHeight:
              15,
          },

          pageSetup: {
            orientation:
              'portrait',

            paperSize:
              9,

            fitToPage:
              false,
          },
        },
      );


    // ============================================
    // ANCHOS DEL EXCEL ORIGINAL
    // ============================================

    hoja.getColumn('A').width =
      14.86;

    hoja.getColumn('B').width =
      51.29;

    hoja.getColumn('C').width =
      22.71;

    hoja.getColumn('D').width =
      12.57;

    hoja.getColumn('E').width =
      20.86;

    hoja.getColumn('F').width =
      15.57;

    hoja.getColumn('G').width =
      30;

    hoja.getColumn('H').width =
      31.71;

    hoja.getColumn('I').width =
      31.86;

    hoja.getColumn('J').width =
      20;

    hoja.getColumn('K').width =
      36.14;

    hoja.getColumn('L').width =
      13;

    hoja.getColumn('M').width =
      13;

    hoja.getColumn('N').width =
      22.43;


    // ============================================
    // AGRUPAR POR DISTRITO
    // ============================================

    const grupos =
      new Map<
        string,
        ResultadoListadoParque[]
      >();

    for (
      const parque
      of parques
    ) {
      const clave =
        parque.distrito
          ? this.formatearDistrito(
              parque.distrito
                .numero_distrito,

              parque.distrito
                .nombre_distrito,
            )
          : 'SIN DISTRITO';

      const existentes =
        grupos.get(
          clave,
        ) ?? [];

      existentes.push(
        parque,
      );

      grupos.set(
        clave,
        existentes,
      );
    }


    // ============================================
    // ESTILOS
    // ============================================

    const borde: Partial<
      ExcelJS.Borders
    > = {
      top: {
        style:
          'thin',
        color: {
          argb:
            'FF000000',
        },
      },

      left: {
        style:
          'thin',
        color: {
          argb:
            'FF000000',
        },
      },

      bottom: {
        style:
          'thin',
        color: {
          argb:
            'FF000000',
        },
      },

      right: {
        style:
          'thin',
        color: {
          argb:
            'FF000000',
        },
      },
    };


    // ============================================
    // ENCABEZADOS
    // ============================================

    const encabezados = [
      'DISTRITO',

      'UBICACIÓN',

      'FINCA ',

      'm2',

      'PLANO',

      'VISADO',

      'DECLARACION',

      'ASOCIACIÓN QUE \nCORRESPONDE ',

      'FECHA FIRMA DE CONVENIO',

      'PLAZO AÑOS',

      'RENOVACIÓN DE FIRMAS',

      'ESTADO CONVENIO',

      'ESTADO DEL PARQUE ',

      'INVERSION ',
    ];


    // ============================================
    // FILA ACTUAL
    // ============================================

    let filaActual =
      2;


    // ============================================
    // RECORRER DISTRITOS
    // ============================================

    for (
      const [
        nombreDistrito,
        parquesDistrito,
      ]
      of grupos
    ) {

      // ==========================================
      // TÍTULO
      // ==========================================

      hoja.mergeCells(
        filaActual,
        1,
        filaActual,
        14,
      );

      const celdaTitulo =
        hoja.getCell(
          filaActual,
          1,
        );

      celdaTitulo.value =
        'CONVENIOS DE ADMINISTRACION PROPIEDADES MUNICIPALES ';

      celdaTitulo.font = {
        name:
          'Arial',

        size:
          11,

        bold:
          true,
      };

      celdaTitulo.alignment = {
        horizontal:
          'center',

        vertical:
          'middle',
      };

      celdaTitulo.border =
        borde;

      hoja.getRow(
        filaActual,
      ).height =
        18;

      filaActual++;


      // ==========================================
      // ENCABEZADOS
      // ==========================================

      const filaEncabezado =
        hoja.getRow(
          filaActual,
        );

      encabezados.forEach(
        (
          encabezado,
          indice,
        ) => {
          const celda =
            filaEncabezado.getCell(
              indice + 1,
            );

          celda.value =
            encabezado;

          celda.font = {
            name:
              'Arial',

            size:
              10,

            bold:
              true,
          };

          celda.alignment = {
            horizontal:
              'center',

            vertical:
              'middle',

            wrapText:
              true,
          };

          celda.border =
            borde;
        },
      );

      filaEncabezado.height =
        35;

      filaActual++;


      // ==========================================
      // PARQUES DEL DISTRITO
      // ==========================================

      const filaInicialDistrito =
        filaActual;

      for (
        const parque
        of parquesDistrito
      ) {

        // ========================================
        // DECLARACIONES
        // ========================================

        let textoDeclaracion =
          'SIN DECLARACION';

        if (
          parque.declaraciones.length >
          0
        ) {
          textoDeclaracion =
            parque.declaraciones
              .map(
                (
                  declaracion,
                ) =>
                  `DECLARACION\n${this.formatearFechaCorta(
                    declaracion
                      .fecha_declaracion,
                  )}`,
              )
              .join(
                '\n',
              );
        }


        // ========================================
        // CONVENIOS
        // ========================================

        let fechaFirma =
          '-';

        let plazo =
          '-';

        let renovacion =
          '-';

        let estadoConvenio =
          'NO HAY';

        if (
          parque.convenios.length >
          0
        ) {
          fechaFirma =
            parque.convenios
              .map(
                (
                  convenio,
                ) =>
                  this.formatearFecha(
                    convenio
                      .fecha_firma,
                  ),
              )
              .join(
                '\n',
              );

          plazo =
            parque.convenios
              .map(
                (
                  convenio,
                ) =>
                  `${convenio.plazo} ${
                    convenio.plazo ===
                    1
                      ? 'AÑO'
                      : 'AÑOS'
                  }`,
              )
              .join(
                '\n',
              );

          renovacion =
            parque.convenios
              .map(
                (
                  convenio,
                ) =>
                  this.formatearFecha(
                    convenio
                      .fecha_renovacion_firmas,
                  ),
              )
              .join(
                '\n',
              );

          estadoConvenio =
            parque.convenios
              .map(
                (
                  convenio,
                ) =>
                  String(
                    convenio.estado_convenio ??
                      '',
                  )
                    .trim()
                    .toUpperCase(),
              )
              .join(
                '\n',
              );
        }


        // ========================================
        // INVERSIÓN
        // ========================================

        const inversion =
          parque.inversion.total >
          0
            ? parque.inversion.total
            : null;


        // ========================================
        // AGREGAR FILA
        // ========================================

        const fila =
          hoja.getRow(
            filaActual,
          );

        fila.values = [
          nombreDistrito,

          parque.ubicacion
            .trim()
            .toUpperCase(),

          parque.numero_finca,

          parque.area,

          parque.numero_plano,

          parque.visado
            .trim()
            .toUpperCase(),

          textoDeclaracion,

          parque.encargado
            ?.entidad_encargada
            ?.trim()
            .toUpperCase() ??
            '',

          fechaFirma,

          plazo,

          renovacion,

          estadoConvenio,

          parque.estado
            .trim()
            .toUpperCase(),

          inversion,
        ];


        // ========================================
        // FORMATO FILA
        // ========================================

        for (
          let columna = 1;
          columna <= 14;
          columna++
        ) {
          const celda =
            fila.getCell(
              columna,
            );

          celda.font = {
            name:
              'Arial',

            size:
              10,
          };

          celda.alignment = {
            horizontal:
              columna === 2 ||
              columna === 8
                ? 'left'
                : 'center',

            vertical:
              'middle',

            wrapText:
              true,
          };

          celda.border =
            borde;
        }


        // ========================================
        // FORMATOS NUMÉRICOS
        // ========================================

        fila.getCell(
          4,
        ).numFmt =
          '#,##0.00';

        fila.getCell(
          14,
        ).numFmt =
          '₡#,##0.00';


        // ========================================
        // ALTURA
        // ========================================

        fila.height =
          this.calcularAlturaFila(
            [
              textoDeclaracion,
              fechaFirma,
              plazo,
              renovacion,
              estadoConvenio,
            ],
          );

        filaActual++;
      }


      // ==========================================
      // COMBINAR DISTRITO VERTICALMENTE
      // ==========================================

      const filaFinalDistrito =
        filaActual - 1;

      if (
        filaFinalDistrito >
        filaInicialDistrito
      ) {
        hoja.mergeCells(
          filaInicialDistrito,
          1,
          filaFinalDistrito,
          1,
        );
      }

      const celdaDistrito =
        hoja.getCell(
          filaInicialDistrito,
          1,
        );

      celdaDistrito.value =
        nombreDistrito;

      celdaDistrito.font = {
        name:
          'Arial',

        size:
          10,

        bold:
          true,
      };

      celdaDistrito.alignment = {
        horizontal:
          'center',

        vertical:
          'middle',

        wrapText:
          true,
      };

      celdaDistrito.border =
        borde;


      // ==========================================
      // ESPACIO ENTRE DISTRITOS
      // ==========================================

      filaActual +=
        2;
    }


    // ============================================
    // CONFIGURACIÓN DE IMPRESIÓN
    // ============================================

    hoja.pageSetup.margins = {
      left:
        0.25,

      right:
        0.25,

      top:
        0.5,

      bottom:
        0.5,

      header:
        0.2,

      footer:
        0.2,
    };


    // ============================================
    // GENERAR BUFFER
    // ============================================

    const buffer =
      await workbook.xlsx.writeBuffer();

    return Buffer.from(
      buffer,
    );
  }


  // ============================================
  // FECHA CORTA PARA DECLARACIÓN
  // ============================================

  private formatearFechaCorta(
    fecha:
      | Date
      | string
      | null
      | undefined,
  ): string {
    if (!fecha) {
      return '-';
    }

    if (
      typeof fecha ===
      'string'
    ) {
      const texto =
        fecha.substring(
          0,
          10,
        );

      const partes =
        texto.split(
          '-',
        );

      if (
        partes.length === 3
      ) {
        return (
          `${partes[2]}/` +
          `${partes[1]}/` +
          `${partes[0]}`
        );
      }
    }

    const fechaDate =
      fecha instanceof Date
        ? fecha
        : new Date(
            fecha,
          );

    if (
      Number.isNaN(
        fechaDate.getTime(),
      )
    ) {
      return '-';
    }

    const dia =
      String(
        fechaDate.getUTCDate(),
      ).padStart(
        2,
        '0',
      );

    const mes =
      String(
        fechaDate.getUTCMonth() +
          1,
      ).padStart(
        2,
        '0',
      );

    const anio =
      fechaDate.getUTCFullYear();

    return `${dia}/${mes}/${anio}`;
  }


  // ============================================
  // CALCULAR ALTURA DE FILA
  // ============================================

  private calcularAlturaFila(
    textos:
      Array<
        string | null | undefined
      >,
  ): number {
    let lineas =
      1;

    for (
      const texto
      of textos
    ) {
      const cantidad =
        String(
          texto ?? '',
        )
          .split(
            '\n',
          )
          .length;

      if (
        cantidad >
        lineas
      ) {
        lineas =
          cantidad;
      }
    }

    return Math.max(
      30,
      lineas * 15,
    );
  }
}