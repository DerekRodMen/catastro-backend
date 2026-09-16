import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  MoreThan,
  Repository,
} from 'typeorm';

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import {
  Usuario,
} from './entities/usuario.entity';

import {
  UpdateUsuarioDto,
} from './dto/update-usuario.dto';

import {
  InvitarUsuarioDto,
} from './dto/invitar-usuario.dto';

import {
  ActivarUsuarioDto,
} from './dto/activar-usuario.dto';

import {
  SolicitarRecuperacionDto,
} from './dto/solicitar-recuperacion.dto';

import {
  RestablecerPasswordDto,
} from './dto/restablecer-password.dto';

import {
  SolicitarCambioCorreoDto,
} from './dto/solicitar-cambio-correo.dto';

import {
  VerificarCambioCorreoDto,
} from './dto/verificar-cambio-correo.dto';

import {
  UsuarioSeguro,
} from './interfaces/usuario-seguro.interface';

import {
  MailService,
} from '../mail/mail.service';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository:
      Repository<Usuario>,

    private readonly mailService:
      MailService,
  ) {}

  // ============================================
  // QUITAR DATOS SENSIBLES
  // ============================================

  private limpiarUsuario(
    usuario: Usuario,
  ): UsuarioSeguro {
    return {
      id_usuario:
        usuario.id_usuario,

      nombre_usuario:
        usuario.nombre_usuario,

      correo:
        usuario.correo,

      estado:
        usuario.estado,
    };
  }

  // ============================================
  // HASH SHA-256
  // ============================================

  private generarHashToken(
    token: string,
  ): string {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }

  // ============================================
  // GENERAR CÓDIGO DE 6 DÍGITOS
  // ============================================

  private generarCodigoCorreo():
    string {
    return crypto
      .randomInt(
        100000,
        1000000,
      )
      .toString();
  }

  // ============================================
  // LIMPIAR CAMBIO DE CORREO PENDIENTE
  // ============================================

  private limpiarCambioCorreoPendiente(
    usuario: Usuario,
  ): void {
    usuario.correo_pendiente =
      null;

    usuario.codigo_correo_hash =
      null;

    usuario.codigo_correo_expiracion =
      null;
  }

  // ============================================
  // INVITAR USUARIO
  // ============================================

  async invitar(
    invitarUsuarioDto:
      InvitarUsuarioDto,
  ): Promise<{
    message: string;
  }> {
    const correo =
      invitarUsuarioDto.correo
        .trim()
        .toLowerCase();

    const existente =
      await this.usuarioRepository.findOne({
        where: {
          correo,
        },
      });

    if (existente) {
      throw new ConflictException(
        'Ya existe un usuario registrado con ese correo.',
      );
    }

    const token =
      crypto
        .randomBytes(32)
        .toString('hex');

    const tokenHash =
      this.generarHashToken(
        token,
      );

    const horasExpiracion =
      Number(
        process.env
          .ACTIVATION_TOKEN_EXPIRES_HOURS ||
          24,
      );

    const expiracion =
      new Date();

    expiracion.setHours(
      expiracion.getHours() +
        horasExpiracion,
    );

    const usuario =
      this.usuarioRepository.create({
        nombre_usuario:
          null,

        correo,

        password:
          null,

        estado:
          false,

        token_activacion:
          tokenHash,

        token_expiracion:
          expiracion,

        correo_pendiente:
          null,

        codigo_correo_hash:
          null,

        codigo_correo_expiracion:
          null,
      });

    const usuarioGuardado =
      await this.usuarioRepository.save(
        usuario,
      );

    try {
      await this.mailService.enviarInvitacionUsuario(
        correo,
        token,
      );
    } catch (error) {
      await this.usuarioRepository.remove(
        usuarioGuardado,
      );

      throw error;
    }

    return {
      message:
        'Invitación enviada correctamente.',
    };
  }

  // ============================================
  // ACTIVAR CUENTA
  // ============================================

  async activarCuenta(
    activarUsuarioDto:
      ActivarUsuarioDto,
  ): Promise<{
    message: string;
  }> {
    const tokenHash =
      this.generarHashToken(
        activarUsuarioDto.token,
      );

    const usuario =
      await this.usuarioRepository.findOne({
        where: {
          token_activacion:
            tokenHash,

          token_expiracion:
            MoreThan(
              new Date(),
            ),
        },
      });

    if (!usuario) {
      throw new BadRequestException(
        'El enlace de activación es inválido o ha expirado.',
      );
    }

    if (usuario.estado) {
      throw new BadRequestException(
        'La cuenta ya se encuentra activa.',
      );
    }

    const nombre =
      activarUsuarioDto
        .nombre_usuario
        .trim();

    if (
      nombre.length > 50
    ) {
      throw new BadRequestException(
        'El nombre no puede superar los 50 caracteres.',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        activarUsuarioDto.password,
        10,
      );

    usuario.nombre_usuario =
      nombre;

    usuario.password =
      passwordHash;

    usuario.estado =
      true;

    usuario.token_activacion =
      null;

    usuario.token_expiracion =
      null;

    await this.usuarioRepository.save(
      usuario,
    );

    return {
      message:
        'Cuenta activada correctamente. Ya puede iniciar sesión.',
    };
  }

  // ============================================
  // SOLICITAR RECUPERACIÓN
  // ============================================

  async solicitarRecuperacion(
    dto:
      SolicitarRecuperacionDto,
  ): Promise<{
    message: string;
  }> {
    const correo =
      dto.correo
        .trim()
        .toLowerCase();

    const mensajeGenerico =
      'Si existe una cuenta asociada a ese correo, recibirá un enlace de recuperación.';

    const usuario =
      await this.usuarioRepository.findOne({
        where: {
          correo,
        },
      });

    if (!usuario) {
      return {
        message:
          mensajeGenerico,
      };
    }

    if (!usuario.password) {
      return {
        message:
          mensajeGenerico,
      };
    }

    const token =
      crypto
        .randomBytes(32)
        .toString('hex');

    const tokenHash =
      this.generarHashToken(
        token,
      );

    const expiracion =
      new Date();

    expiracion.setHours(
      expiracion.getHours() + 1,
    );

    usuario.token_activacion =
      tokenHash;

    usuario.token_expiracion =
      expiracion;

    await this.usuarioRepository.save(
      usuario,
    );

    try {
      await this.mailService.enviarRecuperacionPassword(
        correo,
        token,
      );
    } catch (error) {
      usuario.token_activacion =
        null;

      usuario.token_expiracion =
        null;

      await this.usuarioRepository.save(
        usuario,
      );

      throw error;
    }

    return {
      message:
        mensajeGenerico,
    };
  }

  // ============================================
  // RESTABLECER CONTRASEÑA
  // ============================================

  async restablecerPassword(
    dto:
      RestablecerPasswordDto,
  ): Promise<{
    message: string;
  }> {
    const tokenHash =
      this.generarHashToken(
        dto.token,
      );

    const usuario =
      await this.usuarioRepository.findOne({
        where: {
          token_activacion:
            tokenHash,

          token_expiracion:
            MoreThan(
              new Date(),
            ),
        },
      });

    if (!usuario) {
      throw new BadRequestException(
        'El enlace de recuperación es inválido o ha expirado.',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        dto.password,
        10,
      );

    usuario.password =
      passwordHash;

    usuario.token_activacion =
      null;

    usuario.token_expiracion =
      null;

    await this.usuarioRepository.save(
      usuario,
    );

    return {
      message:
        'Contraseña actualizada correctamente. Ya puede iniciar sesión.',
    };
  }

  // ============================================
  // LISTAR USUARIOS
  // ============================================

  async findAll():
    Promise<UsuarioSeguro[]> {
    const usuarios =
      await this.usuarioRepository.find({
        order: {
          correo:
            'ASC',
        },
      });

    return usuarios.map(
      (usuario) =>
        this.limpiarUsuario(
          usuario,
        ),
    );
  }

  // ============================================
  // BUSCAR POR ID
  // ============================================

  async findOne(
    id: number,
  ): Promise<Usuario> {
    const usuario =
      await this.usuarioRepository.findOne({
        where: {
          id_usuario:
            id,
        },
      });

    if (!usuario) {
      throw new NotFoundException(
        'No se encontró el usuario solicitado.',
      );
    }

    return usuario;
  }

  // ============================================
  // BUSCAR POR CORREO
  // LOGIN
  // ============================================

  async findByCorreo(
    correo: string,
  ): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({
      where: {
        correo:
          correo
            .trim()
            .toLowerCase(),
      },
    });
  }

  // ============================================
  // SOLICITAR CAMBIO DE CORREO
  // ============================================

  async solicitarCambioCorreo(
    id: number,
    dto:
      SolicitarCambioCorreoDto,
  ): Promise<{
    message: string;
    correo_pendiente: string;
  }> {
    const usuario =
      await this.findOne(id);

    const correoNuevo =
      dto.correo_nuevo
        .trim()
        .toLowerCase();

    if (
      correoNuevo ===
      usuario.correo
        .trim()
        .toLowerCase()
    ) {
      throw new BadRequestException(
        'El nuevo correo debe ser diferente al correo actual.',
      );
    }

    const existente =
      await this.usuarioRepository.findOne({
        where: {
          correo:
            correoNuevo,
        },
      });

    if (
      existente &&
      existente.id_usuario !==
        id
    ) {
      throw new ConflictException(
        'Ya existe un usuario registrado con ese correo.',
      );
    }

    // Si el usuario ya está activado,
    // aplicamos nombre y estado en este momento.
    // El correo se mantiene sin cambios
    // hasta verificar el código.
    if (
      usuario.nombre_usuario !==
      null &&
      dto.nombre_usuario !==
      undefined
    ) {
      const nombre =
        dto.nombre_usuario
          .trim();

      if (
        nombre.length > 50
      ) {
        throw new BadRequestException(
          'El nombre no puede superar los 50 caracteres.',
        );
      }

      usuario.nombre_usuario =
        nombre;
    }

    if (
      usuario.nombre_usuario !==
      null &&
      dto.estado !==
      undefined
    ) {
      usuario.estado =
        dto.estado;
    }

    const codigo =
      this.generarCodigoCorreo();

    const codigoHash =
      this.generarHashToken(
        codigo,
      );

    const expiracion =
      new Date();

    expiracion.setMinutes(
      expiracion.getMinutes() +
        10,
    );

    usuario.correo_pendiente =
      correoNuevo;

    usuario.codigo_correo_hash =
      codigoHash;

    usuario.codigo_correo_expiracion =
      expiracion;

    await this.usuarioRepository.save(
      usuario,
    );

    try {
      await this.mailService.enviarCodigoCambioCorreo(
        correoNuevo,
        codigo,
      );
    } catch (error) {
      this.limpiarCambioCorreoPendiente(
        usuario,
      );

      await this.usuarioRepository.save(
        usuario,
      );

      throw error;
    }

    return {
      message:
        'Se envió un código de verificación al nuevo correo.',

      correo_pendiente:
        correoNuevo,
    };
  }

  // ============================================
  // VERIFICAR CAMBIO DE CORREO
  // ============================================

  async verificarCambioCorreo(
    id: number,
    dto:
      VerificarCambioCorreoDto,
  ): Promise<{
    message: string;
  }> {
    const usuario =
      await this.findOne(id);

    if (
      !usuario.correo_pendiente ||
      !usuario.codigo_correo_hash ||
      !usuario.codigo_correo_expiracion
    ) {
      throw new BadRequestException(
        'No existe un cambio de correo pendiente para este usuario.',
      );
    }

    if (
      usuario.codigo_correo_expiracion.getTime() <=
      Date.now()
    ) {
      this.limpiarCambioCorreoPendiente(
        usuario,
      );

      await this.usuarioRepository.save(
        usuario,
      );

      throw new BadRequestException(
        'El código de verificación ha expirado. Solicite uno nuevo.',
      );
    }

    const codigoHash =
      this.generarHashToken(
        dto.codigo,
      );

    const hashEsperado =
      Buffer.from(
        usuario.codigo_correo_hash,
        'utf8',
      );

    const hashRecibido =
      Buffer.from(
        codigoHash,
        'utf8',
      );

    const coincide =
      hashEsperado.length ===
        hashRecibido.length &&
      crypto.timingSafeEqual(
        hashEsperado,
        hashRecibido,
      );

    if (!coincide) {
      throw new BadRequestException(
        'El código de verificación es incorrecto.',
      );
    }

    // Verificamos nuevamente que nadie
    // haya ocupado el correo mientras
    // se esperaba el código.
    const existente =
      await this.usuarioRepository.findOne({
        where: {
          correo:
            usuario.correo_pendiente,
        },
      });

    if (
      existente &&
      existente.id_usuario !==
        id
    ) {
      throw new ConflictException(
        'El correo ya fue registrado por otro usuario.',
      );
    }

    usuario.correo =
      usuario.correo_pendiente;

    this.limpiarCambioCorreoPendiente(
      usuario,
    );

    await this.usuarioRepository.save(
      usuario,
    );

    return {
      message:
        'Correo electrónico verificado y actualizado correctamente.',
    };
  }

  // ============================================
  // REENVIAR CÓDIGO DE CAMBIO DE CORREO
  // ============================================

  async reenviarCodigoCambioCorreo(
    id: number,
  ): Promise<{
    message: string;
  }> {
    const usuario =
      await this.findOne(id);

    if (
      !usuario.correo_pendiente
    ) {
      throw new BadRequestException(
        'No existe un cambio de correo pendiente para este usuario.',
      );
    }

    const codigo =
      this.generarCodigoCorreo();

    const codigoHash =
      this.generarHashToken(
        codigo,
      );

    const expiracion =
      new Date();

    expiracion.setMinutes(
      expiracion.getMinutes() +
        10,
    );

    usuario.codigo_correo_hash =
      codigoHash;

    usuario.codigo_correo_expiracion =
      expiracion;

    await this.usuarioRepository.save(
      usuario,
    );

    try {
      await this.mailService.enviarCodigoCambioCorreo(
        usuario.correo_pendiente,
        codigo,
      );
    } catch (error) {
      throw error;
    }

    return {
      message:
        'Se envió un nuevo código de verificación.',
    };
  }

  // ============================================
  // ACTUALIZAR USUARIO
  // ============================================

  async update(
    id: number,
    updateUsuarioDto:
      UpdateUsuarioDto,
  ): Promise<UsuarioSeguro> {
    const usuario =
      await this.findOne(id);

    // ========================================
    // CORREO
    // ========================================
    // Un correo diferente NO puede cambiarse
    // directamente con PATCH. Debe pasar
    // por el código de verificación.

    if (
      updateUsuarioDto.correo !==
      undefined
    ) {
      const correo =
        updateUsuarioDto.correo
          .trim()
          .toLowerCase();

      if (
        correo !==
        usuario.correo
          .trim()
          .toLowerCase()
      ) {
        throw new BadRequestException(
          'Para cambiar el correo electrónico debe completar la verificación por código.',
        );
      }
    }

    // ========================================
    // NOMBRE
    // ========================================

    if (
      updateUsuarioDto
        .nombre_usuario !==
      undefined &&
      usuario.nombre_usuario !==
        null
    ) {
      const nombre =
        updateUsuarioDto
          .nombre_usuario
          .trim();

      if (
        nombre.length > 50
      ) {
        throw new BadRequestException(
          'El nombre no puede superar los 50 caracteres.',
        );
      }

      usuario.nombre_usuario =
        nombre;
    }

    // ========================================
    // ESTADO
    // ========================================

    if (
      updateUsuarioDto.estado !==
        undefined &&
      usuario.nombre_usuario !==
        null
    ) {
      usuario.estado =
        updateUsuarioDto.estado;
    }

    const actualizado =
      await this.usuarioRepository.save(
        usuario,
      );

    return this.limpiarUsuario(
      actualizado,
    );
  }

  // ============================================
  // ELIMINAR USUARIO
  // ============================================

  async remove(
    id: number,
  ): Promise<{
    message: string;
  }> {
    const usuario =
      await this.findOne(id);

    await this.usuarioRepository.remove(
      usuario,
    );

    return {
      message:
        'Usuario eliminado correctamente.',
    };
  }
}
