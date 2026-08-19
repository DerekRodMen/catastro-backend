
/*
    ============================================================
    BASE DE DATOS: CATÁSTRO
    ARCHIVO: 02_create_tables.sql
    ============================================================

    Crea exactamente las tablas, campos, tipos de datos,
    claves primarias, claves foráneas y restricciones
    existentes en la base de datos original.
*/

USE Catastro;
GO

/*
    ============================================================
    TABLA: ASOCIACION
    ============================================================
*/

IF OBJECT_ID('dbo.ASOCIACION', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ASOCIACION
    (
        id_asociacion INT IDENTITY(1,1) NOT NULL,
        nombre_asociacion VARCHAR(150) NOT NULL,
        cedula_juridica VARCHAR(20) NOT NULL,
        nombre_encargado VARCHAR(150) NOT NULL,
        correo_encargado VARCHAR(150) NOT NULL,
        telefono_encargado VARCHAR(20) NOT NULL,

        CONSTRAINT PK_ASOCIACION
            PRIMARY KEY (id_asociacion)
    );
END
GO


/*
    ============================================================
    TABLA: DISTRITO
    ============================================================
*/

IF OBJECT_ID('dbo.DISTRITO', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DISTRITO
    (
        id_distrito INT IDENTITY(1,1) NOT NULL,
        nombre_distrito VARCHAR(100) NOT NULL,
        numero_distrito INT NOT NULL,

        CONSTRAINT PK_DISTRITO
            PRIMARY KEY (id_distrito)
    );
END
GO


/*
    ============================================================
    TABLA: PARQUE
    ============================================================
*/

IF OBJECT_ID('dbo.PARQUE', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PARQUE
    (
        id_parque INT IDENTITY(1,1) NOT NULL,
        ubicacion VARCHAR(200) NOT NULL,
        numero_finca VARCHAR(50) NOT NULL,
        area DECIMAL(12,2) NOT NULL,
        numero_plano VARCHAR(50) NOT NULL,
        visado VARCHAR(50) NOT NULL,
        estado VARCHAR(50) NOT NULL,
        descripcion_inversion VARCHAR(500) NOT NULL,
        inversion DECIMAL(12,2) NOT NULL,
        fecha_inversion DATE NOT NULL,
        id_distrito INT NOT NULL,
        id_asociacion INT NOT NULL,

        CONSTRAINT PK_PARQUE
            PRIMARY KEY (id_parque)
    );
END
GO


/*
    ============================================================
    TABLA: CONVENIO
    ============================================================
*/

IF OBJECT_ID('dbo.CONVENIO', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CONVENIO
    (
        id_convenio INT IDENTITY(1,1) NOT NULL,
        fecha_firma DATE NOT NULL,
        plazo INT NOT NULL,
        fecha_renovacion_firmas DATE NOT NULL,
        estado_convenio VARCHAR(50) NOT NULL,
        id_parque INT NOT NULL,

        CONSTRAINT PK_CONVENIO
            PRIMARY KEY (id_convenio)
    );
END
GO


/*
    ============================================================
    TABLA: DECLARACION
    ============================================================
*/

IF OBJECT_ID('dbo.DECLARACION', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DECLARACION
    (
        id_declaracion INT IDENTITY(1,1) NOT NULL,
        fecha_declaracion DATE NOT NULL,
        vigente BIT NOT NULL,
        id_parque INT NOT NULL,

        CONSTRAINT PK_DECLARACION
            PRIMARY KEY (id_declaracion)
    );
END
GO


/*
    ============================================================
    TABLA: USUARIO
    ============================================================
*/

IF OBJECT_ID('dbo.USUARIO', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.USUARIO
    (
        id_usuario INT IDENTITY(1,1) NOT NULL,
        nombre_usuario VARCHAR(100) NOT NULL,
        correo VARCHAR(150) NOT NULL,
        password VARCHAR(255) NOT NULL,
        estado BIT NOT NULL
            CONSTRAINT DF_USUARIO_ESTADO DEFAULT ((1)),

        CONSTRAINT PK_USUARIO
            PRIMARY KEY (id_usuario),

        CONSTRAINT UQ_USUARIO_CORREO
            UNIQUE (correo)
    );
END
GO


/*
    ============================================================
    CLAVE FORÁNEA: PARQUE -> ASOCIACION
    ============================================================
*/

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_PARQUE_ASOCIACION'
)
BEGIN
    ALTER TABLE dbo.PARQUE
    ADD CONSTRAINT FK_PARQUE_ASOCIACION
        FOREIGN KEY (id_asociacion)
        REFERENCES dbo.ASOCIACION (id_asociacion);
END
GO


/*
    ============================================================
    CLAVE FORÁNEA: PARQUE -> DISTRITO
    ============================================================
*/

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_PARQUE_DISTRITO'
)
BEGIN
    ALTER TABLE dbo.PARQUE
    ADD CONSTRAINT FK_PARQUE_DISTRITO
        FOREIGN KEY (id_distrito)
        REFERENCES dbo.DISTRITO (id_distrito);
END
GO


/*
    ============================================================
    CLAVE FORÁNEA: CONVENIO -> PARQUE
    ============================================================
*/

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_CONVENIO_PARQUE'
)
BEGIN
    ALTER TABLE dbo.CONVENIO
    ADD CONSTRAINT FK_CONVENIO_PARQUE
        FOREIGN KEY (id_parque)
        REFERENCES dbo.PARQUE (id_parque);
END
GO


/*
    ============================================================
    CLAVE FORÁNEA: DECLARACION -> PARQUE
    ============================================================
*/

IF NOT EXISTS
(
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_DECLARACION_PARQUE'
)
BEGIN
    ALTER TABLE dbo.DECLARACION
    ADD CONSTRAINT FK_DECLARACION_PARQUE
        FOREIGN KEY (id_parque)
        REFERENCES dbo.PARQUE (id_parque);
END
GO
```
