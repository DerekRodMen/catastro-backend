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

  renameSync,

  rmSync,

  unlinkSync,

  writeFileSync,

} from 'fs';

import {

  isAbsolute,

  join,

  relative,

  resolve,

} from 'path';

import {

  Mantenimiento,

} from './entities/mantenimiento.entity';

import {

  MantenimientoImagen,

  TipoImagenMantenimiento,

} from './entities/mantenimiento-imagen.entity';

import {

  Parque,

} from '../parque/entities/parque.entity';

import {

  CreateMantenimientoDto,

} from './dto/create-mantenimiento.dto';

import {

  UpdateMantenimientoDto,

} from './dto/update-mantenimiento.dto';

import {

  AuditoriaService,

} from '../auditoria/auditoria.service';

import type {

  UsuarioAuditoria,

} from '../auditoria/interfaces/usuario-auditoria.interface';

@Injectable()

export class MantenimientoService {

  private readonly storageRoot =

    resolve(

      process.env.MANTENIMIENTOS_STORAGE_PATH ||

      'C:\\\Mantenimientos Catastro',

    );

  constructor(

    @InjectRepository(Mantenimiento)

    private readonly mantenimientoRepository:

      Repository<Mantenimiento>,

    @InjectRepository(MantenimientoImagen)

    private readonly imagenRepository:

      Repository<MantenimientoImagen>,

    @InjectRepository(Parque)

    private readonly parqueRepository:

      Repository<Parque>,

    private readonly auditoriaService:

      AuditoriaService,

  ) {

    this.asegurarDirectorio(

      this.storageRoot,

    );

  }

  // Prepara un resumen del mantenimiento para registrarlo en auditoría.

  private obtenerDatosAuditoria(

    mantenimiento: Mantenimiento,

  ): Record<string, unknown> {

    const imagenes =

      mantenimiento.imagenes || [];

    return {

      id_mantenimiento:

        mantenimiento.id_mantenimiento,

      nombre_mantenimiento:

        mantenimiento.nombre_mantenimiento,

      descripcion:

        mantenimiento.descripcion,

      inversion:

        Number(

          mantenimiento.inversion ?? 0,

        ),

      descripcion_inversion:

        mantenimiento.descripcion_inversion,

      fecha_mantenimiento:

        mantenimiento.fecha_mantenimiento,

      id_parque:

        mantenimiento.id_parque,

      parque:

        mantenimiento.parque

          ?.ubicacion ??

        null,

      imagenes_antes:

        imagenes.filter(

          (imagen) =>

            imagen.tipo === 'ANTES',

        ).length,

      imagenes_despues:

        imagenes.filter(

          (imagen) =>

            imagen.tipo === 'DESPUES',

        ).length,

    };

  }

  // Registra las acciones realizadas sobre los mantenimientos.

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

          'MANTENIMIENTOS',

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

        'Error registrando auditoría de mantenimientos:',

        error,

      );

    }

  }

  // =====================================================

  // CREAR

  // =====================================================

  async create(

    dto: CreateMantenimientoDto,

    imagenesAntes: Express.Multer.File[] = [],

    imagenesDespues: Express.Multer.File[] = [],

    usuario: UsuarioAuditoria,

  ) {

    // Busca el parque asociado al mantenimiento.

    const parque =
      await this.buscarParque(

        dto.id_parque,

      );

    // Crea el mantenimiento con los datos recibidos.

    const mantenimiento =
      this.mantenimientoRepository.create({

        nombre_mantenimiento:

          dto.nombre_mantenimiento.trim(),

        descripcion:

          dto.descripcion.trim(),

        inversion:

          Number(dto.inversion),

        descripcion_inversion:

          dto.descripcion_inversion.trim(),

        fecha_mantenimiento:

          dto.fecha_mantenimiento,

        id_parque:

          parque.id_parque,

        parque,

      });

    const guardado =

      await this.mantenimientoRepository.save(

        mantenimiento,

      );

    try {

      // Guarda las imágenes asociadas al mantenimiento.

      await this.guardarGrupoImagenes(
        guardado,

        parque,

        'ANTES',

        imagenesAntes,

      );

      await this.guardarGrupoImagenes(

        guardado,

        parque,

        'DESPUES',

        imagenesDespues,

      );

      const resultado =

        await this.findOne(

          guardado.id_mantenimiento,

        );

      await this.registrarAuditoria(

        usuario,

        'CREAR',

        resultado.id_mantenimiento,

        `Se creó el mantenimiento "${resultado.nombre_mantenimiento}".`,

        null,

        this.obtenerDatosAuditoria(

          resultado,

        ),

      );

      return resultado;

    } catch (error) {

      const carpeta =

        this.obtenerCarpetaMantenimiento(

          parque,

          guardado,

        );

      if (

        existsSync(carpeta)

      ) {

        rmSync(

          carpeta,

          {

            recursive: true,

            force: true,

          },

        );

      }

      await this.mantenimientoRepository.delete(

        guardado.id_mantenimiento,

      );

      throw error;

    }

  }

  // =====================================================

  // LISTAR

  // =====================================================

  async findAll() {

    const mantenimientos =

      await this.mantenimientoRepository.find({

        relations: {

          parque: {

            distrito: true,

          },

          imagenes: true,

        },

        order: {

          fecha_mantenimiento: 'DESC',

          id_mantenimiento: 'DESC',

        },

      });

    return mantenimientos.map(

      (mantenimiento) => {

        mantenimiento.imagenes =

          this.ordenarImagenes(

            mantenimiento.imagenes || [],

          );

        return mantenimiento;

      },

    );

  }

  // =====================================================

  // BUSCAR UNO

  // =====================================================

  async findOne(

    id: number,

  ) {

    const mantenimiento =

      await this.mantenimientoRepository.findOne({

        where: {

          id_mantenimiento: id,

        },

        relations: {

          parque: {

            distrito: true,

          },

          imagenes: true,

        },

      });

    if (

      !mantenimiento

    ) {

      throw new NotFoundException(

        'Mantenimiento no encontrado.',

      );

    }

    mantenimiento.imagenes =

      this.ordenarImagenes(

        mantenimiento.imagenes || [],

      );

    return mantenimiento;

  }

  // =====================================================

  // ACTUALIZAR

  // =====================================================

  async update(

    id: number,

    dto: UpdateMantenimientoDto,

    imagenesAntes: Express.Multer.File[] = [],

    imagenesDespues: Express.Multer.File[] = [],

    usuario: UsuarioAuditoria,

  ) {

    const mantenimiento =

      await this.findOne(

        id,

      );

    const datosAnteriores =

      this.obtenerDatosAuditoria(

        mantenimiento,

      );

    const parqueAnterior =

      mantenimiento.parque;

    // Obtiene la carpeta actual antes de aplicar cambios.

    const carpetaAnterior =
      this.obtenerCarpetaMantenimiento(

        parqueAnterior,

        mantenimiento,

      );

    let parqueNuevo =

      parqueAnterior;

    if (

      dto.id_parque !== undefined

    ) {

      parqueNuevo =

        await this.buscarParque(

          dto.id_parque,

        );

    }

    if (

      dto.nombre_mantenimiento !== undefined

    ) {

      mantenimiento.nombre_mantenimiento =

        dto.nombre_mantenimiento.trim();

    }

    if (

      dto.descripcion !== undefined

    ) {

      mantenimiento.descripcion =

        dto.descripcion.trim();

    }

    if (

      dto.inversion !== undefined

    ) {

      mantenimiento.inversion =

        Number(dto.inversion);

    }

    if (

      dto.descripcion_inversion !== undefined

    ) {

      mantenimiento.descripcion_inversion =

        dto.descripcion_inversion.trim();

    }

    if (

      dto.fecha_mantenimiento !== undefined

    ) {

      mantenimiento.fecha_mantenimiento =

        dto.fecha_mantenimiento;

    }

    mantenimiento.id_parque =

      parqueNuevo.id_parque;

    mantenimiento.parque =

      parqueNuevo;

    // Calcula la carpeta que debe usar después de la actualización.

    const carpetaNueva =
      this.obtenerCarpetaMantenimiento(

        parqueNuevo,

        mantenimiento,

      );

    if (

      resolve(carpetaAnterior) !==

      resolve(carpetaNueva) &&

      existsSync(carpetaAnterior)

    ) {

      this.asegurarDirectorio(

        resolve(

          carpetaNueva,

          '..',

        ),

      );

      this.verificarRutaSegura(

        carpetaAnterior,

      );

      this.verificarRutaSegura(

        carpetaNueva,

      );

      // Renombra o mueve la carpeta física si cambió el parque o el nombre.

      renameSync(

        carpetaAnterior,

        carpetaNueva,

      );

      for (

        const imagen of

        mantenimiento.imagenes || []

      ) {

        const carpetaTipo =

          imagen.tipo === 'ANTES'

            ? 'Antes'

            : 'Despues';

        const nombreArchivo =

          imagen.ruta_imagen

            .replace(/\\\\\\\\/g, '/')

            .split('/')

            .pop();

        if (

          nombreArchivo

        ) {

          const nuevaRutaAbsoluta =

            join(

              carpetaNueva,

              carpetaTipo,

              nombreArchivo,

            );

          imagen.ruta_imagen =

            relative(

              this.storageRoot,

              nuevaRutaAbsoluta,

            );

          await this.imagenRepository.save(

            imagen,

          );

        }

      }

    }

    await this.mantenimientoRepository.save(

      mantenimiento,

    );

    await this.guardarGrupoImagenes(

      mantenimiento,

      parqueNuevo,

      'ANTES',

      imagenesAntes,

    );

    await this.guardarGrupoImagenes(

      mantenimiento,

      parqueNuevo,

      'DESPUES',

      imagenesDespues,

    );

    const resultado =

      await this.findOne(

        id,

      );

    await this.registrarAuditoria(

      usuario,

      'EDITAR',

      resultado.id_mantenimiento,

      `Se modificó el mantenimiento "${resultado.nombre_mantenimiento}".`,

      datosAnteriores,

      this.obtenerDatosAuditoria(

        resultado,

      ),

    );

    return resultado;

  }

  // =====================================================

  // ELIMINAR MANTENIMIENTO

  // =====================================================

  async remove(

    id: number,

    usuario: UsuarioAuditoria,

  ) {

    const mantenimiento =

      await this.findOne(

        id,

      );

    const datosAnteriores =

      this.obtenerDatosAuditoria(

        mantenimiento,

      );

    const idMantenimiento =

      mantenimiento.id_mantenimiento;

    const nombreMantenimiento =

      mantenimiento.nombre_mantenimiento;

    const carpeta =

      this.obtenerCarpetaMantenimiento(

        mantenimiento.parque,

        mantenimiento,

      );

    await this.mantenimientoRepository.remove(

      mantenimiento,

    );

    if (

      existsSync(carpeta)

    ) {

      this.verificarRutaSegura(

        carpeta,

      );

      rmSync(

        carpeta,

        {

          recursive: true,

          force: true,

        },

      );

    }

    await this.registrarAuditoria(

      usuario,

      'ELIMINAR',

      idMantenimiento,

      `Se eliminó el mantenimiento "${nombreMantenimiento}".`,

      datosAnteriores,

      null,

    );

    return {

      message:

        'Mantenimiento eliminado correctamente.',

    };

  }

  // =====================================================

  // ELIMINAR UNA IMAGEN

  // =====================================================

  async eliminarImagen(

    idMantenimiento: number,

    idImagen: number,

    usuario: UsuarioAuditoria,

  ) {

    const mantenimiento =

      await this.findOne(

        idMantenimiento,

      );

    const datosAnteriores =

      this.obtenerDatosAuditoria(

        mantenimiento,

      );

    const imagen =

      await this.imagenRepository.findOne({

        where: {

          id_imagen:

            idImagen,

          id_mantenimiento:

            idMantenimiento,

        },

      });

    if (

      !imagen

    ) {

      throw new NotFoundException(

        'Imagen no encontrada.',

      );

    }

    const rutaAbsoluta =

      resolve(

        this.storageRoot,

        imagen.ruta_imagen,

      );

    this.verificarRutaSegura(

      rutaAbsoluta,

    );

    if (

      existsSync(

        rutaAbsoluta,

      )

    ) {

      unlinkSync(

        rutaAbsoluta,

      );

    }

    await this.imagenRepository.remove(

      imagen,

    );

    const actualizado =

      await this.findOne(

        idMantenimiento,

      );

    await this.registrarAuditoria(

      usuario,

      'EDITAR',

      actualizado.id_mantenimiento,

      `Se eliminó una imagen del mantenimiento "${actualizado.nombre_mantenimiento}".`,

      datosAnteriores,

      this.obtenerDatosAuditoria(

        actualizado,

      ),

    );

    return {

      message:

        'Imagen eliminada correctamente.',

    };

  }

  // =====================================================

  // OBTENER IMAGEN

  // =====================================================

  async obtenerImagen(

    idMantenimiento: number,

    idImagen: number,

  ) {

    const imagen =

      await this.imagenRepository.findOne({

        where: {

          id_imagen:

            idImagen,

          id_mantenimiento:

            idMantenimiento,

        },

      });

    if (

      !imagen

    ) {

      throw new NotFoundException(

        'Imagen no encontrada.',

      );

    }

    const rutaAbsoluta =

      resolve(

        this.storageRoot,

        imagen.ruta_imagen,

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

        'El archivo de imagen no existe en el servidor.',

      );

    }

    return {

      buffer:

        readFileSync(

          rutaAbsoluta,

        ),

      contentType:

        this.obtenerContentType(

          rutaAbsoluta,

        ),

    };

  }

  // =====================================================

  // CANTIDAD POR PARQUE

  // =====================================================

  async obtenerCantidadPorParque(

    idParque: number,

  ) {

    const cantidad =

      await this.mantenimientoRepository.count({

        where: {

          id_parque:

            idParque,

        },

      });

    return {

      id_parque:

        idParque,

      cantidad_mantenimientos:

        cantidad,

    };

  }

  // =====================================================

  // GUARDAR GRUPO DE IMÁGENES

  // =====================================================

  // Guarda las imágenes de tipo ANTES o DESPUÉS en su carpeta correspondiente.

  private async guardarGrupoImagenes(

    mantenimiento: Mantenimiento,

    parque: Parque,

    tipo: TipoImagenMantenimiento,

    archivos: Express.Multer.File[],

  ) {

    if (

      !archivos ||

      archivos.length === 0

    ) {

      return;

    }

    const existentes =

      await this.imagenRepository.find({

        where: {

          id_mantenimiento:

            mantenimiento.id_mantenimiento,

          tipo,

        },

      });

    let siguienteOrden =

      existentes.reduce(

        (

          mayor,

          imagen,

        ) =>

          Math.max(

            mayor,

            imagen.orden,

          ),

        0,

      ) + 1;

    const carpetaMantenimiento =

      this.obtenerCarpetaMantenimiento(

        parque,

        mantenimiento,

      );

    const carpetaTipo =

      join(

        carpetaMantenimiento,

        tipo === 'ANTES'

          ? 'Antes'

          : 'Despues',

      );

    this.verificarRutaSegura(

      carpetaTipo,

    );

    this.asegurarDirectorio(

      carpetaTipo,

    );

    for (

      const archivo of archivos

    ) {

      const extension =

        this.obtenerExtensionSegura(

          archivo,

        );

      const nombreArchivo =

        tipo === 'ANTES'

          ? `mantenimiento_antes_${siguienteOrden}${extension}`

          : `mantenimiento_despues_${siguienteOrden}${extension}`;

      const rutaAbsoluta =

        join(

          carpetaTipo,

          nombreArchivo,

        );

      this.verificarRutaSegura(

        rutaAbsoluta,

      );

      writeFileSync(

        rutaAbsoluta,

        archivo.buffer,

      );

      const imagen =

        this.imagenRepository.create({

          id_mantenimiento:

            mantenimiento.id_mantenimiento,

          tipo,

          ruta_imagen:

            relative(

              this.storageRoot,

              rutaAbsoluta,

            ),

          orden:

            siguienteOrden,

        });

      await this.imagenRepository.save(

        imagen,

      );

      siguienteOrden++;

    }

  }

  // =====================================================

  // PARQUE

  // =====================================================

  // Busca y valida que el parque exista.

  private async buscarParque(

    idParque: number,

  ) {

    const parque =

      await this.parqueRepository.findOne({

        where: {

          id_parque:

            idParque,

        },

      });

    if (

      !parque

    ) {

      throw new NotFoundException(

        'Parque no encontrado.',

      );

    }

    return parque;

  }

  // =====================================================

  // CARPETA

  // =====================================================

  // Construye la ruta física donde se guardan los archivos del mantenimiento.

  private obtenerCarpetaMantenimiento(

    parque: Parque,

    mantenimiento: Mantenimiento,

  ) {

    const parqueNombre =

      this.sanitizarNombre(

        parque.ubicacion ||

        `Parque_${parque.id_parque}`,

      );

    const mantenimientoNombre =

      this.sanitizarNombre(

        mantenimiento.nombre_mantenimiento ||

        'Mantenimiento',

      );

    const ruta =

      join(

        this.storageRoot,

        parqueNombre,

        `${mantenimientoNombre}_${mantenimiento.id_mantenimiento}`,

      );

    this.verificarRutaSegura(

      ruta,

    );

    return ruta;

  }

  // =====================================================

  // SANITIZACIÓN

  // =====================================================

  // Limpia nombres para que puedan usarse de forma segura en carpetas y archivos.

  private sanitizarNombre(

    valor: string,

  ) {

    const limpio =

      valor

        .replace(

          /[<>:"/\\\\\\\\|?\\*\x00-\x1F]/g,

          '_',

        )

        .replace(

          /\\\\.+$/g,

          '',

        )

        .replace(

          /\s+/g,

          ' ',

        )

        .trim()

        .slice(

          0,

          80,

        );

    return limpio ||

      'Sin_nombre';

  }

  // =====================================================

  // SEGURIDAD RUTAS

  // =====================================================

  // Evita que una ruta salga de la carpeta principal de mantenimientos.

  private verificarRutaSegura(

    rutaObjetivo: string,

  ) {

    const rutaRoot =

      resolve(

        this.storageRoot,

      );

    const rutaFinal =

      resolve(

        rutaObjetivo,

      );

    const rutaRelativa =

      relative(

        rutaRoot,

        rutaFinal,

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

  // =====================================================

  // DIRECTORIOS

  // =====================================================

  // Crea la carpeta si todavía no existe.

  private asegurarDirectorio(

    ruta: string,

  ) {

    this.verificarRutaSegura(

      ruta,

    );

    if (

      !existsSync(

        ruta,

      )

    ) {

      mkdirSync(

        ruta,

        {

          recursive: true,

        },

      );

    }

  }

  // =====================================================

  // EXTENSIÓN

  // =====================================================

  // Valida el tipo de imagen y devuelve una extensión permitida.

  private obtenerExtensionSegura(

    archivo: Express.Multer.File,

  ) {

    switch (

      archivo.mimetype

    ) {

      case 'image/jpeg':

        return '.jpg';

      case 'image/png':

        return '.png';

      case 'image/webp':

        return '.webp';

      default:

        throw new BadRequestException(

          'Formato de imagen no permitido.',

        );

    }

  }

  // =====================================================

  // CONTENT TYPE

  // =====================================================

  // Determina el Content-Type según la extensión del archivo.

  private obtenerContentType(

    ruta: string,

  ) {

    const minuscula =

      ruta.toLowerCase();

    if (

      minuscula.endsWith(

        '.png',

      )

    ) {

      return 'image/png';

    }

    if (

      minuscula.endsWith(

        '.webp',

      )

    ) {

      return 'image/webp';

    }

    return 'image/jpeg';

  }

  // =====================================================

  // ORDENAR IMÁGENES

  // =====================================================

  // Ordena primero las imágenes ANTES y luego las DESPUÉS.

  private ordenarImagenes(

    imagenes: MantenimientoImagen[],

  ) {

    return [...imagenes].sort(

      (

        a,

        b,

      ) => {

        if (

          a.tipo !== b.tipo

        ) {

          return a.tipo === 'ANTES'

            ? -1

            : 1;

        }

        return a.orden -

          b.orden;

      },

    );

  }

}
