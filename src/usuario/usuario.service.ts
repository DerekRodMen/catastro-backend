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
  // HASH DE TOKEN
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

    const passwordHash =
      await bcrypt.hash(
        activarUsuarioDto.password,
        10,
      );

    usuario.nombre_usuario =
      activarUsuarioDto
        .nombre_usuario
        .trim();

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

    // No revelamos si el correo existe
    if (!usuario) {
      return {
        message:
          mensajeGenerico,
      };
    }

    // Si todavía no activó la cuenta,
    // no hacemos recuperación normal.
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

    // Token de recuperación válido
    // por 1 hora
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
      // Limpiamos el token si falla
      // el envío del correo.
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
  // ACTUALIZAR USUARIO
  // ============================================

  async update(
    id: number,
    updateUsuarioDto:
      UpdateUsuarioDto,
  ): Promise<UsuarioSeguro> {
    const usuario =
      await this.findOne(id);

    // CORREO

    if (
      updateUsuarioDto.correo !==
      undefined
    ) {
      const correo =
        updateUsuarioDto.correo
          .trim()
          .toLowerCase();

      const existente =
        await this.usuarioRepository.findOne({
          where: {
            correo,
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

      usuario.correo =
        correo;
    }

    // NOMBRE

    if (
      updateUsuarioDto
        .nombre_usuario !==
      undefined
    ) {
      usuario.nombre_usuario =
        updateUsuarioDto
          .nombre_usuario;
    }

    // ESTADO

    if (
      updateUsuarioDto.estado !==
      undefined
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