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

import { ApiTags } from '@nestjs/swagger';

import { AsociacionService } from './asociacion.service';
import { CreateAsociacionDto } from './dto/create-asociacion.dto';
import { UpdateAsociacionDto } from './dto/update-asociacion.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Asociaciones')
@Controller('asociaciones')
export class AsociacionController {
  constructor(
    private readonly asociacionService: AsociacionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body()
    createAsociacionDto: CreateAsociacionDto,
  ) {
    return this.asociacionService.create(
      createAsociacionDto,
    );
  }

  @Get()
  findAll() {
    return this.asociacionService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.asociacionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateAsociacionDto: UpdateAsociacionDto,
  ) {
    return this.asociacionService.update(
      id,
      updateAsociacionDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.asociacionService.remove(id);
  }
}