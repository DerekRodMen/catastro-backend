import * as sql from 'mssql/msnodesqlv8';

const config = {
  connectionString:
    'DSN=CatastroDB;Trusted_Connection=Yes;',
};

async function test() {
  try {
    console.log('Conectando mediante DSN...');

    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .query(
        'SELECT DB_NAME() AS databaseName, SUSER_SNAME() AS usuario',
      );

    console.log('================================');
    console.log('CONEXIÓN EXITOSA');
    console.log('================================');
    console.log(result.recordset);

    await pool.close();
  } catch (error) {
    console.error('ERROR DE CONEXIÓN:');
    console.error(error);
  }
}

test();