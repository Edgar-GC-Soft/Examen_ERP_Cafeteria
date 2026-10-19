const { consultar, transaccion } = require('../config/db');
const { ErrorHttp } = require('../middleware/errores');
const xmlService = require('./xml.service');

const IVA = 0.16;
const RFC = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;

// valida el carrito y calcula los totales con los precios de la BD (nunca con los del navegador)
async function calcularCarrito(carrito) {
    if (!Array.isArray(carrito) || carrito.length === 0) {
        throw new ErrorHttp(400, 'El carrito esta vacio');
    }
    const lineas = [];
    let subtotalCentavos = 0;
    for (const item of carrito) {
        if (!Number.isSafeInteger(item.id) || !Number.isSafeInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > 100) {
            throw new ErrorHttp(400, 'Producto o cantidad invalida');
        }
        const [producto] = await consultar('SELECT * FROM productos WHERE id = ? AND fecha_baja IS NULL', [item.id]);
        if (!producto) {
            throw new ErrorHttp(400, 'Producto no disponible');
        }
        if (producto.stock < item.cantidad) {
            throw new ErrorHttp(409, `Stock insuficiente de ${producto.nombre}`);
        }
        subtotalCentavos += Math.round(producto.costoVenta * 100) * item.cantidad;
        lineas.push({ productoId: producto.id, cantidad: item.cantidad, precioUnitario: producto.costoVenta });
    }
    const ivaCentavos = Math.round(subtotalCentavos * IVA);
    return {
        lineas,
        subtotal: subtotalCentavos / 100,
        iva: ivaCentavos / 100,
        total: (subtotalCentavos + ivaCentavos) / 100 // total = subtotal + IVA
    };
}

// crea la venta en estado CREADA (todavia no descuenta stock ni registra ingreso)
async function crearVenta(clienteId, { productos, metodoPago, nombreReceptor, rfcReceptor }) {
    if (!['paypal', 'efectivo'].includes(metodoPago)) {
        throw new ErrorHttp(400, 'Metodo de pago invalido');
    }
    const rfc = String(rfcReceptor || '').trim().toUpperCase();
    if (!nombreReceptor || !nombreReceptor.trim() || !RFC.test(rfc)) {
        throw new ErrorHttp(400, 'Nombre o RFC invalido');
    }
    const calculo = await calcularCarrito(productos);

    return transaccion(async (con) => {
        const venta = await consultar(
            'INSERT INTO ventas (cliente_id, subtotal, iva, total, metodo_pago) VALUES (?, ?, ?, ?, ?)',
            [clienteId, calculo.subtotal, calculo.iva, calculo.total, metodoPago], con
        );
        for (const l of calculo.lineas) {
            await consultar(
                'INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [venta.insertId, l.productoId, l.cantidad, l.precioUnitario], con
            );
        }
        const folio = 'FAC-' + String(venta.insertId).padStart(6, '0');
        await consultar(
            'INSERT INTO facturas (venta_id, folio, total, nombre_receptor, rfc_receptor) VALUES (?, ?, ?, ?, ?)',
            [venta.insertId, folio, calculo.total, nombreReceptor.trim(), rfc], con
        );
        return { ventaId: venta.insertId, total: calculo.total };
    });
}

// el pago ya se confirmo (efectivo, o PayPal capturado): descuenta stock, registra el ingreso y genera el XML
async function completarVenta(ventaId) {
    return transaccion(async (con) => {
        const [venta] = await consultar('SELECT * FROM ventas WHERE id = ? FOR UPDATE', [ventaId], con);
        if (!venta || venta.estado === 'PAGADA') {
            throw new ErrorHttp(409, 'La venta ya fue procesada');
        }
        const detalle = await consultar(
            `SELECT d.producto_id, d.cantidad, d.precio_unitario, p.nombre
             FROM detalle_venta d JOIN productos p ON p.id = d.producto_id WHERE d.venta_id = ?`, [ventaId], con
        );
        for (const d of detalle) {
            const r = await consultar(
                'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?', // descuenta el stock
                [d.cantidad, d.productoId, d.cantidad], con
            );
            if (r.affectedRows === 0) {
                throw new ErrorHttp(409, `Stock insuficiente de ${d.nombre}`);
            }
        }
        await consultar("UPDATE ventas SET estado = 'PAGADA' WHERE id = ?", [ventaId], con);
        // la venta genera un ingreso
        await consultar(
            "INSERT INTO transacciones (tipo, concepto, monto, origen, venta_id) VALUES ('Ingreso', ?, ?, 'Venta', ?)",
            [`Venta #${ventaId}`, venta.total, ventaId], con
        );
        const [factura] = await consultar('SELECT * FROM facturas WHERE venta_id = ?', [ventaId], con);
        factura.xml = xmlService.comprobante(venta, detalle, factura);
        await consultar('UPDATE facturas SET xml = ?, fecha_emision = NOW() WHERE id = ?', [factura.xml, factura.id], con);

        const [cliente] = await consultar('SELECT nombre, correo FROM usuarios WHERE id = ?', [venta.clienteId], con);
        return { venta, factura, cliente };
    });
}

// historial: el admin ve todas las ventas, el cliente solo las suyas (fechas opcionales)
function obtenerVentas(usuario, desde, hasta) {
    return consultar(
        `SELECT v.id, v.fecha, u.nombre AS cliente, v.metodo_pago, v.subtotal, v.iva, v.total, f.folio
         FROM ventas v JOIN usuarios u ON u.id = v.cliente_id JOIN facturas f ON f.venta_id = v.id
         WHERE v.estado = 'PAGADA'
           AND (? = 'admin' OR v.cliente_id = ?)
           AND DATE(v.fecha) >= COALESCE(?, '1000-01-01') AND DATE(v.fecha) <= COALESCE(?, '9999-12-31')
         ORDER BY v.fecha DESC`,
        [usuario.rol, usuario.id, desde || null, hasta || null]
    );
}

// datos para reenviar el comprobante por correo
async function obtenerComprobante(ventaId, usuario) {
    const [venta] = await consultar("SELECT * FROM ventas WHERE id = ? AND estado = 'PAGADA'", [ventaId]);
    if (!venta || (usuario.rol !== 'admin' && venta.clienteId !== usuario.id)) {
        throw new ErrorHttp(404, 'Venta no encontrada');
    }
    const [factura] = await consultar('SELECT * FROM facturas WHERE venta_id = ?', [ventaId]);
    const [cliente] = await consultar('SELECT nombre, correo FROM usuarios WHERE id = ?', [venta.clienteId]);
    return { venta, factura, cliente };
}

module.exports = { crearVenta, completarVenta, obtenerVentas, obtenerComprobante };
