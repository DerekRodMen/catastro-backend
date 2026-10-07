import {

  BadRequestException,

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

  existsSync,

  mkdirSync,

  readFileSync,

  rmSync,

  unlinkSync,

  writeFileSync,

} from 'fs';

import {

  extname,

  isAbsolute,

  join,

  relative,

  resolve,

} from 'path';

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

import {

  AuditoriaService,

} from '../auditoria/auditoria.service';

import type {

  UsuarioAuditoria,

} from '../auditoria/interfaces/usuario-auditoria.interface';

import { randomBytes } from 'crypto';

@Injectable()

export class ConvenioService {

  private readonly tokensDocumento = new Map<

    string,

    { idConvenio: number; expiraEn: number; modo: 'ver' | 'descargar' }

  >();

  private readonly storageRoot = resolve(

    process.env.CONVENIOS_STORAGE_PATH ||

      'C:\\Convenios catastro',

  );

  constructor(

    @InjectRepository(Convenio)

    private readonly convenioRepository: Repository<Convenio>,

    @InjectRepository(Parque)

    private readonly parqueRepository: Repository<Parque>,

    private readonly auditoriaService: AuditoriaService,

  ) {}

  // =====================================================

  // FECHAS

  // =====================================================

  private crearFechaLocal(fecha: string): Date {

    const [anio, mes, dia] = fecha

      .split('-')

      .map(Number);

    return new Date(

      anio,

      mes - 1,

      dia,

    );

  }

  /**

   * SQL Server / TypeORM puede devolver una columna DATE

   * como string "YYYY-MM-DD" o como objeto Date.

   *

   * Esta función soporta ambos casos.

   */

  private formatearFecha(

    fecha: Date | string | null | undefined,

  ): string | null {

    if (!fecha) {

      return null;

    }

    // SQL Server puede devolver DATE como string.

    if (typeof fecha === 'string') {

      const valor = fecha.trim();

      if (!valor) {

        return null;

      }

      const coincidencia = valor.match(

        /^(\d{4})-(\d{2})-(\d{2})/,

      );

      if (coincidencia) {

        return `${coincidencia[1]}-${coincidencia[2]}-${coincidencia[3]}`;

      }

      const convertida = new Date(valor);

      if (Number.isNaN(convertida.getTime())) {

        return valor;

      }

      const anio = convertida.getFullYear();

      const mes = String(

        convertida.getMonth() + 1,

      ).padStart(

        2,

        '0',

      );

      const dia = String(

        convertida.getDate(),

      ).padStart(

        2,

        '0',

      );

      return `${anio}-${mes}-${dia}`;

    }

    // Si realmente es un Date.

    if (fecha instanceof Date) {

      if (Number.isNaN(fecha.getTime())) {

        return null;

      }

      const anio = fecha.getFullYear();

      const mes = String(

        fecha.getMonth() + 1,

      ).padStart(

        2,

        '0',

      );

      const dia = String(

        fecha.getDate(),

      ).padStart(

        2,

        '0',

      );

      return `${anio}-${mes}-${dia}`;

    }

    return null;

  }

  private calcularEstadoConvenio(

    fechaRenovacion: string | Date,

    estadoActual?: string,

  ): string {

    let renovacion: Date;

    if (typeof fechaRenovacion === 'string') {

      renovacion =

        this.crearFechaLocal(

          fechaRenovacion.substring(

            0,

            10,

          ),

        );

    } else {

      renovacion = new Date(

        fechaRenovacion.getFullYear(),

        fechaRenovacion.getMonth(),

        fechaRenovacion.getDate(),

      );

    }

    const hoy = new Date();

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

  // =====================================================

  // AUDITORÍA

  // =====================================================

  private obtenerDatosAuditoria(

    convenio: Convenio,

  ): Record<string, unknown> {

    return {

      id_convenio:

        convenio.id_convenio,

      numero_convenio:

        convenio.numero_convenio,

      fecha_firma:

        this.formatearFecha(

          convenio.fecha_firma,

        ),

      plazo:

        convenio.plazo,

      fecha_renovacion_firmas:

        this.formatearFecha(

          convenio.fecha_renovacion_firmas,

        ),

      estado_convenio:

        convenio.estado_convenio,

      id_parque:

        convenio.parque

          ?.id_parque ??

        null,

      parque:

        convenio.parque

          ?.ubicacion ??

        null,

      documento:

        convenio.documento_nombre_original,

      documento_mime:

        convenio.documento_mime,

      documento_tamano:

        convenio.documento_tamano,

    };

  }

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

          'CONVENIOS',

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

        'Error registrando auditoría de convenios:',

        error,

      );

    }

  }

  // =====================================================

  // CREAR

  // =====================================================

  async create(

    createConvenioDto:

      CreateConvenioDto,

    usuario: UsuarioAuditoria,

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

        documento_nombre_original:

          null,

        documento_ruta:

          null,

        documento_mime:

          null,

        documento_tamano:

          null,

        parque,

      });

    const guardado =

      await this.convenioRepository.save(

        convenio,

      );

    await this.registrarAuditoria(

      usuario,

      'CREAR',

      guardado.id_convenio,

      `Se creó el convenio "${guardado.numero_convenio}".`,

      null,

      this.obtenerDatosAuditoria(

        guardado,

      ),

    );

    return guardado;

  }

  // =====================================================

  // LISTAR

  // =====================================================

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

  // =====================================================

  // BUSCAR UNO

  // =====================================================

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

  // =====================================================

  // EDITAR

  // =====================================================

  async update(

    id: number,

    updateConvenioDto:

      UpdateConvenioDto,

    usuario: UsuarioAuditoria,

  ): Promise<Convenio> {

    const convenio =

      await this.findOne(id);

    const datosAnteriores =

      this.obtenerDatosAuditoria(

        convenio,

      );

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

    const guardado =

      await this.convenioRepository.save(

        convenio,

      );

    await this.registrarAuditoria(

      usuario,

      'EDITAR',

      guardado.id_convenio,

      `Se modificó el convenio "${guardado.numero_convenio}".`,

      datosAnteriores,

      this.obtenerDatosAuditoria(

        guardado,

      ),

    );

    return guardado;

  }

  // =====================================================

  // GUARDAR / REEMPLAZAR DOCUMENTO

  // =====================================================

  async guardarDocumento(

    id: number,

    archivo:

      Express.Multer.File,

    usuario:

      UsuarioAuditoria,

  ): Promise<Convenio> {

    if (!archivo) {

      throw new BadRequestException(

        'Debe seleccionar un documento.',

      );

    }

    const convenio =

      await this.findOne(id);

    const datosAnteriores =

      this.obtenerDatosAuditoria(

        convenio,

      );

    const extension =

      this.obtenerExtensionDocumento(

        archivo,

      );

    const carpeta =

      this.obtenerCarpetaConvenio(

        convenio.numero_convenio,

      );

    this.asegurarDirectorio(

      carpeta,

    );

    // Eliminar documento anterior.

    if (

      convenio.documento_ruta

    ) {

      const rutaAnterior =

        resolve(

          this.storageRoot,

          convenio.documento_ruta,

        );

      this.verificarRutaSegura(

        rutaAnterior,

      );

      if (

        existsSync(

          rutaAnterior,

        )

      ) {

        unlinkSync(

          rutaAnterior,

        );

      }

    }

    const rutaAbsoluta =

      join(

        carpeta,

        `${this.obtenerNombreSeguroConvenio(convenio.numero_convenio)}${extension}`,

      );

    this.verificarRutaSegura(

      rutaAbsoluta,

    );

    try {

      writeFileSync(

        rutaAbsoluta,

        archivo.buffer,

      );

    } catch (error) {

      console.error(

        'Error guardando documento de convenio:',

        error,

      );

      throw new BadRequestException(

        'No fue posible guardar el documento en C:\\Convenios catastro.',

      );

    }

    convenio.documento_nombre_original =

      archivo.originalname;

    convenio.documento_ruta =

      relative(

        this.storageRoot,

        rutaAbsoluta,

      );

    convenio.documento_mime =

      archivo.mimetype;

    convenio.documento_tamano =

      archivo.size;

    try {

      const guardado =

        await this.convenioRepository.save(

          convenio,

        );

      await this.registrarAuditoria(

        usuario,

        'EDITAR',

        guardado.id_convenio,

        datosAnteriores.documento

          ? `Se reemplazó el documento de respaldo del convenio "${guardado.numero_convenio}".`

          : `Se adjuntó el documento de respaldo del convenio "${guardado.numero_convenio}".`,

        datosAnteriores,

        this.obtenerDatosAuditoria(

          guardado,

        ),

      );

      return guardado;

    } catch (error) {

      // Si falla SQL después de escribir el archivo,

      // eliminamos el archivo para evitar basura física.

      try {

        if (

          existsSync(

            rutaAbsoluta,

          )

        ) {

          unlinkSync(

            rutaAbsoluta,

          );

        }

      } catch {

        // No bloquear el error original.

      }

      throw error;

    }

  }

  crearTokenDocumento(

    idConvenio: number,

    modo: 'ver' | 'descargar',

  ): string {

    const token = randomBytes(32).toString('hex');

    this.tokensDocumento.set(token, {

      idConvenio,

      expiraEn: Date.now() + 5 * 60_000,

      modo,

    });

    return token;

  }

  consumirTokenDocumento(

    token: string,

    idConvenio: number,

  ): { modo: 'ver' | 'descargar' } {

    const datos = this.tokensDocumento.get(token);

    if (!datos) {

      throw new NotFoundException(

        'El enlace del documento no es válido o ya fue utilizado.',

      );

    }

    if (

      datos.idConvenio !== idConvenio ||

      datos.expiraEn < Date.now()

    ) {

      this.tokensDocumento.delete(token);

      throw new NotFoundException(

        'El enlace del documento expiró.',

      );

    }

    return {

      modo: datos.modo,

    };

  }

  // =====================================================

  // OBTENER DOCUMENTO

  // =====================================================

  async obtenerDocumento(

    id: number,

  ): Promise<{

    buffer: Buffer;

    nombre: string;

    mime: string;

  }> {

    const convenio =

      await this.findOne(id);

    if (

      !convenio.documento_ruta

    ) {

      throw new NotFoundException(

        'Este convenio no tiene un documento de respaldo.',

      );

    }

    const rutaAbsoluta =

      resolve(

        this.storageRoot,

        convenio.documento_ruta,

      );

    this.verificarRutaSegura(

      rutaAbsoluta,

    );

    if (

      !existsSync(

        rutaAbsoluta,

      )

    ) {

      throw new NotFoundException(

        'El documento de respaldo no existe en el servidor.',

      );

    }

    return {

      buffer:

        readFileSync(

          rutaAbsoluta,

        ),

      nombre:

        convenio

          .documento_nombre_original ||

        `convenio_${convenio.id_convenio}${extname(rutaAbsoluta)}`,

      mime:

        convenio

          .documento_mime ||

        'application/octet-stream',

    };

  }

  // =====================================================

  // ELIMINAR CONVENIO

  // =====================================================

  async remove(

    id: number,

    usuario:

      UsuarioAuditoria,

  ): Promise<{

    message: string;

  }> {

    const convenio =

      await this.findOne(id);

    const datosAnteriores =

      this.obtenerDatosAuditoria(

        convenio,

      );

    const idConvenio =

      convenio.id_convenio;

    const numeroConvenio =

      convenio.numero_convenio;

    await this.convenioRepository.remove(

      convenio,

    );

    const carpeta =

      this.obtenerCarpetaConvenio(

        numeroConvenio,

      );

    if (

      existsSync(

        carpeta,

      )

    ) {

      try {

        rmSync(

          carpeta,

          {

            recursive: true,

            force: true,

          },

        );

      } catch (error) {

        console.error(

          'No se pudo eliminar la carpeta física del convenio:',

          error,

        );

      }

    }

    await this.registrarAuditoria(

      usuario,

      'ELIMINAR',

      idConvenio,

      `Se eliminó el convenio "${numeroConvenio}".`,

      datosAnteriores,

      null,

    );

    return {

      message:

        'Convenio eliminado correctamente.',

    };

  }

  // =====================================================

  // CARPETA DEL CONVENIO

  // =====================================================

  private obtenerNombreSeguroConvenio(

    numeroConvenio: string | null | undefined,

  ): string {

    if (!numeroConvenio?.trim()) {

      throw new BadRequestException(

        'El convenio no tiene un número de convenio válido para guardar el documento.',

      );

    }

    const nombre =

      numeroConvenio

        .trim()

        .replace(/[<>:"/\\\\|?*\x00-\x1F]/g, '_')

        .replace(/[. ]+$/g, '');

    if (!nombre) {

      throw new BadRequestException(

        'El número de convenio no es válido para guardar el documento.',

      );

    }

    return nombre;

  }

  private obtenerCarpetaConvenio(

    numeroConvenio: string | null | undefined,

  ): string {

    const numeroSeguro =

      this.obtenerNombreSeguroConvenio(

        numeroConvenio,

      );

    const ruta =

      join(

        this.storageRoot,

        numeroSeguro,

      );

    this.verificarRutaSegura(

      ruta,

    );

    return ruta;

  }

  // =====================================================

  // VALIDAR EXTENSIÓN

  // =====================================================

  private obtenerExtensionDocumento(

    archivo:

      Express.Multer.File,

  ): string {

    const extensionOriginal =

      extname(

        archivo.originalname,

      )

        .toLowerCase();

    const extensionesPermitidas =

      [

        '.pdf',

        '.doc',

        '.docx',

      ];

    if (

      !extensionesPermitidas.includes(

        extensionOriginal,

      )

    ) {

      throw new BadRequestException(

        'Formato no permitido. Use PDF, DOC o DOCX.',

      );

    }

    switch (

      archivo.mimetype

    ) {

      case 'application/pdf':

        return '.pdf';

      case 'application/msword':

        return '.doc';

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':

        return '.docx';

      /*

       * Algunos navegadores/SO pueden mandar

       * application/octet-stream.

       * En ese caso validamos por extensión.

       */

      case 'application/octet-stream':

        return extensionOriginal;

      default:

        throw new BadRequestException(

          'Formato no permitido. Use PDF, DOC o DOCX.',

        );

    }

  }

  // =====================================================

  // CREAR DIRECTORIO

  // =====================================================

  private asegurarDirectorio(

    ruta: string,

  ): void {

    this.verificarRutaSegura(

      ruta,

    );

    if (

      !existsSync(

        ruta,

      )

    ) {

      try {

        mkdirSync(

          ruta,

          {

            recursive: true,

          },

        );

      } catch (error) {

        console.error(

          'Error creando directorio de convenios:',

          error,

        );

        throw new BadRequestException(

          'No fue posible crear la carpeta C:\\Convenios catastro.',

        );

      }

    }

  }

  // =====================================================

  // SEGURIDAD DE RUTAS

  // =====================================================

  private verificarRutaSegura(

    rutaObjetivo:

      string,

  ): void {

    const raiz =

      resolve(

        this.storageRoot,

      );

    const final =

      resolve(

        rutaObjetivo,

      );

    const rutaRelativa =

      relative(

        raiz,

        final,

      );

    if (

      rutaRelativa.startsWith(

        '..',

      ) ||

      isAbsolute(

        rutaRelativa,

      )

    ) {

      throw new BadRequestException(

        'Ruta de almacenamiento inválida.',

      );

    }

  }

}
