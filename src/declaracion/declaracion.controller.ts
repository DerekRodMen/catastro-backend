import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ApiTags,
} from '@nestjs/swagger';

import {
  DeclaracionService,
} from './declaracion.service';

import {
  CreateDeclaracionDto,
} from './dto/create-declaracion.dto';

import {
  UpdateDeclaracionDto,
} from './dto/update-declaracion.dto';

@ApiTags('Declaraciones')
@Controller('declaraciones')
export class DeclaracionController {
  constructor(
    private readonly declaracionService:
      DeclaracionService,
  ) {}

  @Post()
  create(
    @Body()
    createDeclaracionDto:
      CreateDeclaracionDto,
  ) {
    return this.declaracionService.create(
      createDeclaracionDto,
    );
  }

  @Get()
  findAll() {
    return this.declaracionService.findAll();
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.declaracionService.findOne(
      id,
    );
  }

  @Patch(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateDeclaracionDto:
      UpdateDeclaracionDto,
  ) {
    return this.declaracionService.update(
      id,
      updateDeclaracionDto,
    );
  }

  @Delete(':id')
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.declaracionService.remove(
      id,
    );
  }
}