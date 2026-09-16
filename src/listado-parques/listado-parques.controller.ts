import {
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';

import type {
  Response,
} from 'express';

import {
  FiltrosListadoParques,
  ListadoParquesService,
  ResultadoListadoParque,
} from './listado-parques.service';


@Controller('listado-parques')
export class ListadoParquesController {
  constructor(
    private readonly listadoParquesService:
      ListadoParquesService,
  ) {}


  // ============================================
  // CONSTRUIR FILTROS
  // ============================================

  private construirFiltros(
    idDistrito?: string,
    idEncargado?: string,
    estado?: string,
    visado?: string,
    estadoConvenio?: string,
    busqueda?: string,
  ): FiltrosListadoParques {
    return {
      id_distrito:
        idDistrito,

      id_encargado:
        idEncargado,

      estado,

      visado,

      estado_convenio:
        estadoConvenio,

      busqueda,
    };
  }


  // ============================================
  // LISTAR PARQUES
  // ============================================

  @Get()
  async listarParques(
    @Query('id_distrito')
    idDistrito?: string,

    @Query('id_encargado')
    idEncargado?: string,

    @Query('estado')
    estado?: string,

    @Query('visado')
    visado?: string,

    @Query('estado_convenio')
    estadoConvenio?: string,

    @Query('busqueda')
    busqueda?: string,
  ): Promise<ResultadoListadoParque[]> {
    const filtros =
      this.construirFiltros(
        idDistrito,
        idEncargado,
        estado,
        visado,
        estadoConvenio,
        busqueda,
      );

    return await this
      .listadoParquesService
      .listar(
        filtros,
      );
  }


  // ============================================
  // GENERAR EXCEL
  // ============================================

  @Get('excel')
  async generarExcel(
    @Res()
    response: Response,

    @Query('id_distrito')
    idDistrito?: string,

    @Query('id_encargado')
    idEncargado?: string,

    @Query('estado')
    estado?: string,

    @Query('visado')
    visado?: string,

    @Query('estado_convenio')
    estadoConvenio?: string,

    @Query('busqueda')
    busqueda?: string,
  ): Promise<void> {
    const filtros =
      this.construirFiltros(
        idDistrito,
        idEncargado,
        estado,
        visado,
        estadoConvenio,
        busqueda,
      );

    const archivo =
      await this
        .listadoParquesService
        .generarExcel(
          filtros,
        );

    const fecha =
      new Date()
        .toISOString()
        .substring(
          0,
          10,
        );

    const nombreArchivo =
      `LISTADO_PARQUES_${fecha}.xlsx`;

    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${nombreArchivo}"`,
    );

    response.setHeader(
      'Content-Length',
      archivo.length,
    );

    response.end(
      archivo,
    );
  }
}