import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { Usuario } from './entities/usuario.entity';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<Usuario> {

    const usuarioExistente =
      await this.usuarioRepository.findOne({
        where: {
          correo: createUsuarioDto.correo,
        },
      });

    if (usuarioExistente) {
      throw new ConflictException(
        'Ya existe un usuario registrado con ese correo',
      );
    }

    const passwordHash = await bcrypt.hash(
      createUsuarioDto.password,
      10,
    );

    const usuario = this.usuarioRepository.create({
      nombre_usuario: createUsuarioDto.nombre_usuario,
      correo: createUsuarioDto.correo,
      password: passwordHash,
      estado:
        createUsuarioDto.estado !== undefined
          ? createUsuarioDto.estado
          : true,
    });

    return await this.usuarioRepository.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find();
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario =
      await this.usuarioRepository.findOne({
        where: {
          id_usuario: id,
        },
      });

    if (!usuario) {
      throw new NotFoundException(
        `No existe el usuario con ID ${id}`,
      );
    }

    return usuario;
  }

  async findByCorreo(
    correo: string,
  ): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({
      where: {
        correo,
      },
    });
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {

    const usuario = await this.findOne(id);

    if (updateUsuarioDto.correo) {
      const usuarioExistente =
        await this.usuarioRepository.findOne({
          where: {
            correo: updateUsuarioDto.correo,
          },
        });

      if (
        usuarioExistente &&
        usuarioExistente.id_usuario !== id
      ) {
        throw new ConflictException(
          'Ya existe un usuario registrado con ese correo',
        );
      }

      usuario.correo = updateUsuarioDto.correo;
    }

    if (updateUsuarioDto.nombre_usuario) {
      usuario.nombre_usuario =
        updateUsuarioDto.nombre_usuario;
    }

    if (updateUsuarioDto.password) {
      usuario.password = await bcrypt.hash(
        updateUsuarioDto.password,
        10,
      );
    }

    if (updateUsuarioDto.estado !== undefined) {
      usuario.estado = updateUsuarioDto.estado;
    }

    return await this.usuarioRepository.save(usuario);
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);

    await this.usuarioRepository.remove(usuario);
  }
}