require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    decimalNumbers: true, // DECIMAL llega como numero y no como texto
    dateStrings: true     // las fechas llegan como texto 'AAAA-MM-DD HH:MM:SS'
});

// convierte nombres_con_guion_bajo a camelCase (costo_venta -> costoVenta)
const camel = (texto) => texto.replace(/_([a-z])/g, (_, letra) => letra.toUpperCase());
const aCamel = (fila) => Object.fromEntries(Object.entries(fila).map(([k, v]) => [camel(k), v]));

// SELECT / INSERT / UPDATE / DELETE: devuelve las filas en camelCase
async function consultar(sql, valores = [], conexion = pool) {
    const [resultado] = await conexion.query(sql, valores);
    return Array.isArray(resultado) ? resultado.map(aCamel) : resultado;
}

// ejecuta varios pasos como una sola operacion (si algo falla, se deshace todo)
async function transaccion(trabajo) {
    const conexion = await pool.getConnection();
    try {
        await conexion.beginTransaction();
        const resultado = await trabajo(conexion);
        await conexion.commit();
        return resultado;
    } catch (error) {
        console.error('Error dentro de la transaccion:', error.code, error.message);
        try {
            await conexion.rollback();
        } catch (_) {
            // si la conexion ya se cerro, no hay nada que deshacer; se conserva el error original
        }
        throw error;
    } finally {
        conexion.release();
    }
}

module.exports = { consultar, transaccion };
