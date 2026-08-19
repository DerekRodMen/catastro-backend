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

import { ConvenioService } from './convenio.service';
import { CreateConvenioDto } from './dto/create-convenio.dto';
import { UpdateConvenioDto } from './dto/update-convenio.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Convenios')
@Controller('convenios')
export class ConvenioController {
  constructor(
    private readonly convenioService: ConvenioService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body()
    createConvenioDto: CreateConvenioDto,
  ) {
    return this.convenioService.create(
      createConvenioDto,
    );
  }

  @Get()
  findAll() {
    return this.convenioService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.convenioService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateConvenioDto: UpdateConvenioDto,
  ) {
    return this.convenioService.update(
      id,
      updateConvenioDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.convenioService.remove(id);
  }
}