
/*
    ============================================================
    BASE DE DATOS: CATÁSTRO
    ARCHIVO: 03_seed_admin.sql
    ============================================================

    Crea el usuario administrador inicial.

    IMPORTANTE:
    El campo password DEBE contener un hash generado con bcrypt,
    porque el backend utiliza bcrypt.compare() para validar
    las contraseñas.

    NO colocar aquí una contraseña en texto plano.
*/

USE Catastro;
GO

/*
    ============================================================
    USUARIO ADMINISTRADOR
    ============================================================

    Si ya existe un usuario con este correo, no se crea otro.

    REEMPLAZAR EL VALOR DE [AQUI_HASH_BCRYPT] por el hash bcrypt
    de la contraseña que quieras utilizar.
*/

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.USUARIO
    WHERE correo = 'admin@catastro.com'
)
BEGIN

    INSERT INTO dbo.USUARIO
    (
        nombre_usuario,
        correo,
        password,
        estado
    )
    VALUES
    (
        'Administrador',
        'admin@catastro.com',

        /*
            REEMPLAZAR ESTE VALOR POR UN HASH BCRYPT REAL
        */
        'AQUI_HASH_BCRYPT',

        1
    );

END
GO

/*
    Verificar que el administrador fue creado.
*/

SELECT
    id_usuario,
    nombre_usuario,
    correo,
    estado
FROM dbo.USUARIO
WHERE correo = 'admin@catastro.com';
GO
```
