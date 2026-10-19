const { consultar } = require('../config/db');

const STOCK_MINIMO = 10; // por debajo de esto se considera existencia baja

async function obtenerResumen() {
    const [ventas] = await consultar(
        "SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS cantidad FROM ventas WHERE estado = 'PAGADA' AND DATE(fecha) = CURDATE()"
    );
    const [compras] = await consultar(
        'SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS cantidad FROM compras WHERE YEAR(fecha) = YEAR(CURDATE()) AND MONTH(fecha) = MONTH(CURDATE())'
    );
    const [stock] = await consultar(
        'SELECT COUNT(*) AS cantidad FROM productos WHERE fecha_baja IS NULL AND stock < ?', [STOCK_MINIMO]
    );
    const [nomina] = await consultar(
        "SELECT (SELECT MAX(fecha_pago) FROM nominas) AS ultimoPago, (SELECT COUNT(*) FROM usuarios WHERE rol = 'admin') AS administradores"
    );
    return {
        ventasHoy: ventas.total, numVentasHoy: ventas.cantidad,
        comprasMes: compras.total, numComprasMes: compras.cantidad,
        stockBajo: stock.cantidad,
        ultimoPagoNomina: nomina.ultimoPago, administradores: nomina.administradores
    };
}

module.exports = { obtenerResumen };
