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

  async login(loginDto: LoginDto) {
    const usuario = await this.usuarioService.findByCorreo(
      loginDto.correo,
    );

    if (!usuario) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    if (!usuario.estado) {
      throw new UnauthorizedException(
        'El usuario se encuentra inactivo',
      );
    }

    const passwordValida = await bcrypt.compare(
      loginDto.password,
      usuario.password,
    );

    if (!passwordValida) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    const payload = {
      sub: usuario.id_usuario,
      correo: usuario.correo,
      nombre_usuario: usuario.nombre_usuario,
    };

    const token = await this.jwtService.signAsync(
      payload,
    );

    return {
      access_token: token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.correo,
      },
    };
  }
}