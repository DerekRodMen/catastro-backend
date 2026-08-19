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

import { ParqueService } from './parque.service';

import { CreateParqueDto } from './dto/create-parque.dto';

import { UpdateParqueDto } from './dto/update-parque.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('parques')
export class ParqueController {
  constructor(
    private readonly parqueService: ParqueService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createParqueDto: CreateParqueDto,
  ) {
    return this.parqueService.create(
      createParqueDto,
    );
  }

  @Get()
  findAll() {
    return this.parqueService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.parqueService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParqueDto: UpdateParqueDto,
  ) {
    return this.parqueService.update(
      id,
      updateParqueDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.parqueService.remove(id);
  }
}