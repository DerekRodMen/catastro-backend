import { Injectable } from '@nestjs/common';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import {
  ConfigService,
} from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    private readonly configService: ConfigService,
  ) {
    const jwtSecret =
      configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET no está configurado en el archivo .env',
      );
    }

    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    return {
      id_usuario: payload.sub,
      correo: payload.correo,
      nombre_usuario: payload.nombre_usuario,
    };
  }
}