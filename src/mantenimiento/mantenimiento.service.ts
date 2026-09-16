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


@Injectable()
export class MantenimientoService {

  private readonly storageRoot =
    resolve(
      process.env.MANTENIMIENTOS_STORAGE_PATH ||
      'C:\\Mantenimientos Catastro',
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

  ) {

    this.asegurarDirectorio(
      this.storageRoot,
    );
  }


  // =====================================================
  // CREAR
  // =====================================================

  async create(
    dto: CreateMantenimientoDto,
    imagenesAntes: Express.Multer.File[] = [],
    imagenesDespues: Express.Multer.File[] = [],
  ) {

    const parque =
      await this.buscarParque(
        dto.id_parque,
      );


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


      return this.findOne(
        guardado.id_mantenimiento,
      );


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
  ) {

    const mantenimiento =
      await this.findOne(
        id,
      );


    const parqueAnterior =
      mantenimiento.parque;


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
            .replace(/\\/g, '/')
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


    return this.findOne(
      id,
    );
  }


  // =====================================================
  // ELIMINAR MANTENIMIENTO
  // =====================================================

  async remove(
    id: number,
  ) {

    const mantenimiento =
      await this.findOne(
        id,
      );


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

  private sanitizarNombre(
    valor: string,
  ) {

    const limpio =
      valor
        .replace(
          /[<>:"/\\|?*\x00-\x1F]/g,
          '_',
        )
        .replace(
          /\.+$/g,
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
