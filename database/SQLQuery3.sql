
/*
    ============================================================
    BASE DE DATOS: CATÁSTRO
    ARCHIVO: 01_create_database.sql
    ============================================================

    Este script crea únicamente la base de datos Catastro.

    No depende de una ruta específica de instalación de
    SQL Server, por lo que puede ejecutarse en otra computadora.
*/

USE master;
GO

IF DB_ID('Catastro') IS NULL
BEGIN
    CREATE DATABASE Catastro;
END
GO

ALTER DATABASE Catastro SET RECOVERY SIMPLE;
GO

ALTER DATABASE Catastro SET READ_WRITE;
GO
```
