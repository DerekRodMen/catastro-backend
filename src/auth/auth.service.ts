import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { UsuarioService } from '../usuario/usuario.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  // ============================
  // LOGIN
  // ============================

  async login(loginDto: LoginDto) {
    // Normalizar correo
    const correo = loginDto.correo
      .trim()
      .toLowerCase();

    // ============================
    // BUSCAR USUARIO
    // ============================

    const usuario =
      await this.usuarioService.findByCorreo(
        correo,
      );

    // ============================
    // USUARIO NO EXISTE
    // ============================

    if (!usuario) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos.',
      );
    }

    // ============================
    // CUENTA SIN ACTIVAR
    // ============================
    // Los usuarios invitados inicialmente
    // tienen password = null.

    if (!usuario.password) {
      throw new UnauthorizedException(
        'La cuenta todavía no ha sido activada. Revise el correo de invitación.',
      );
    }

    // ============================
    // USUARIO INACTIVO
    // ============================

    if (!usuario.estado) {
      throw new UnauthorizedException(
        'El usuario se encuentra inactivo.',
      );
    }

    // ============================
    // VERIFICAR CONTRASEÑA
    // ============================

    const passwordValida =
      await bcrypt.compare(
        loginDto.password,
        usuario.password,
      );

    if (!passwordValida) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos.',
      );
    }

    // ============================
    // CREAR PAYLOAD JWT
    // ============================

    const payload = {
      sub: usuario.id_usuario,
      correo: usuario.correo,
      nombre_usuario:
        usuario.nombre_usuario,
    };

    // ============================
    // GENERAR TOKEN
    // ============================

    const access_token =
      await this.jwtService.signAsync(
        payload,
      );

    // ============================
    // RESPUESTA
    // ============================

    return {
      access_token,

      usuario: {
        id_usuario:
          usuario.id_usuario,

        nombre_usuario:
          usuario.nombre_usuario,

        correo:
          usuario.correo,

        estado:
          usuario.estado,
      },
    };
  }
}