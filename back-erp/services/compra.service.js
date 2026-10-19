const { consultar, transaccion } = require('../config/db');
const { ErrorHttp } = require('../middleware/errores');

// body: { proveedorId, detalle: [{ productoId, cantidad, costoUnitario }] }
async function registrarCompra(administradorId, datos) {
    const detalle = datos.detalle;
    if (!Array.isArray(detalle) || detalle.length === 0) {
        throw new ErrorHttp(400, 'La compra no tiene productos');
    }
    let totalCentavos = 0;
    for (const d of detalle) {
        if (!Number.isInteger(d.cantidad) || d.cantidad < 1 || !(Number(d.costoUnitario) > 0)) {
            throw new ErrorHttp(400, 'Cantidad o costo invalido');
        }
        totalCentavos += d.cantidad * Math.round(d.costoUnitario * 100);
    }
    const total = totalCentavos / 100;

    return transaccion(async (con) => {
        const [proveedor] = await consultar('SELECT id FROM proveedores WHERE id = ?', [datos.proveedorId], con);
        if (!proveedor) {
            throw new ErrorHttp(400, 'Proveedor no encontrado');
        }
        const compra = await consultar(
            'INSERT INTO compras (administrador_id, proveedor_id, total) VALUES (?, ?, ?)',
            [administradorId, datos.proveedorId, total], con
        );
        for (const d of detalle) {
            const r = await consultar(
                'UPDATE productos SET stock = stock + ? WHERE id = ? AND fecha_baja IS NULL', // sube el stock
                [d.cantidad, d.productoId], con
            );
            if (r.affectedRows === 0) {
                throw new ErrorHttp(400, 'Producto no encontrado');
            }
            await consultar(
                'INSERT INTO detalle_compra (compra_id, producto_id, cantidad, costo_unitario) VALUES (?, ?, ?, ?)',
                [compra.insertId, d.productoId, d.cantidad, d.costoUnitario], con
            );
        }
        // la compra genera un egreso
        await consultar(
            "INSERT INTO transacciones (tipo, concepto, monto, origen, compra_id) VALUES ('Egreso', ?, ?, 'Compra', ?)",
            [`Compra #${compra.insertId}`, total, compra.insertId], con
        );
        return { id: compra.insertId, total };
    });
}

// reporte de compras por periodo (fechas opcionales AAAA-MM-DD)
function obtenerCompras(desde, hasta) {
    return consultar(
        `SELECT c.id, c.fecha, p.nombre AS proveedor, c.total
         FROM compras c JOIN proveedores p ON p.id = c.proveedor_id
         WHERE DATE(c.fecha) >= COALESCE(?, '1000-01-01') AND DATE(c.fecha) <= COALESCE(?, '9999-12-31')
         ORDER BY c.fecha DESC`,
        [desde || null, hasta || null]
    );
}

module.exports = { registrarCompra, obtenerCompras };
