import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import { DistritoService } from './distrito.service';

import { CreateDistritoDto } from './dto/create-distrito.dto';
import { UpdateDistritoDto } from './dto/update-distrito.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiBearerAuth('access-token')
@Controller('distritos')
export class DistritoController {
  constructor(
    private readonly distritoService: DistritoService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createDistritoDto: CreateDistritoDto,
  ) {
    return this.distritoService.create(
      createDistritoDto,
    );
  }

  @Get()
  findAll() {
    return this.distritoService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.distritoService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDistritoDto: UpdateDistritoDto,
  ) {
    return this.distritoService.update(
      id,
      updateDistritoDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.distritoService.remove(id);
  }
}