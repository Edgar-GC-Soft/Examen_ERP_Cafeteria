const { consultar } = require('../config/db');
const { ErrorHttp } = require('../middleware/errores');

// filtros opcionales: desde, hasta (AAAA-MM-DD), tipo, origen y buscar (texto del concepto o numero)
function obtenerTransacciones({ desde, hasta, tipo, origen, buscar }) {
    if (tipo && !['Ingreso', 'Egreso'].includes(tipo)) {
        throw new ErrorHttp(400, 'Tipo invalido');
    }
    if (origen && !['Venta', 'Compra', 'Nómina'].includes(origen)) {
        throw new ErrorHttp(400, 'Origen invalido');
    }
    return consultar(
        `SELECT id, fecha, tipo, concepto, origen, monto FROM transacciones
         WHERE DATE(fecha) >= COALESCE(?, '1000-01-01') AND DATE(fecha) <= COALESCE(?, '9999-12-31')
           AND tipo = COALESCE(?, tipo) AND origen = COALESCE(?, origen)
           AND (? IS NULL OR concepto LIKE CONCAT('%', ?, '%') OR id = ?)
         ORDER BY fecha DESC, id DESC`,
        [desde || null, hasta || null, tipo || null, origen || null, buscar || null, buscar || null, Number(buscar) || 0]
    );
}

module.exports = { obtenerTransacciones };
