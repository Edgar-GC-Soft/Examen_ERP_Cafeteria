const { paypalRequest } = require('../services/paypal.service');
const ventaService = require('../services/venta.service');
const correoService = require('../services/correo.service');
const { consultar } = require('../config/db');

// crea la venta y la orden de pago
async function crearOrden(req, res) {
    try {
        console.log('0. llego la peticion, usuario', req.usuario?.id, 'productos:', JSON.stringify(req.body.productos));
        // usa el total calculado por el servidor
        const { ventaId, total } = await ventaService.crearVenta(req.usuario.id, { ...req.body, metodoPago: 'paypal' });
        console.log('1. venta creada', ventaId, 'total', total);

        // configura las url de regreso del pago
        const frontend = process.env.FRONTEND_URL || 'http://localhost:4200';
        const orden = await paypalRequest('/v2/checkout/orders', 'POST', {
            intent: 'CAPTURE',
            purchase_units: [{ amount: { currency_code: 'MXN', value: total.toFixed(2) } }],
            payment_source: {
                paypal: {
                    experience_context: {
                        brand_name: 'ERP Cafetería',
                        user_action: 'PAY_NOW',
                        shipping_preference: 'NO_SHIPPING',
                        return_url: `${frontend}/pago-paypal`,
                        cancel_url: `${frontend}/checkout`
                    }
                }
            }
        });
        console.log('2. PayPal respondio', orden.id);
        // vincula la orden de paypal con la venta
        await consultar('UPDATE ventas SET paypal_order_id = ? WHERE id = ?', [orden.id, ventaId]);
        console.log('3. orden guardada');
        // obtiene el enlace para pagar
        const liga = orden.links.find((l) => l.rel === 'payer-action');
        if (!liga) {
            throw new Error('PayPal no devolvio la liga de pago');
        }
        res.json({ id: orden.id, total, urlPago: liga.href });
    } catch (error) {
        if (error.status) throw error; // conserva errores de validacion
        console.error(error);
        res.status(502).json({ mensaje: 'No se pudo crear la orden' });
    }
}

// confirma el pago y completa la venta
async function capturarOrden(req, res) {
    const { orderId } = req.params;
    try {
        // busca la orden del usuario autenticado
        const [venta] = await consultar(
            'SELECT * FROM ventas WHERE paypal_order_id = ? AND cliente_id = ?', [orderId, req.usuario.id]
        );
        if (!venta) {
            return res.status(404).json({ mensaje: 'Orden no encontrada' });
        }
        // evita procesar la venta más de una vez
        const paso = await consultar("UPDATE ventas SET estado = 'PROCESANDO' WHERE id = ? AND estado = 'CREADA'", [venta.id]);
        if (paso.affectedRows === 0) {
            return res.status(409).json({ mensaje: 'La orden ya fue procesada' });
        }

        // solicita el cobro a paypal
        const resultado = await paypalRequest(`/v2/checkout/orders/${orderId}/capture`, 'POST');

        // verifica el estado, la moneda y el importe del pago
        const captura = resultado.purchase_units
            ?.flatMap((u) => u.payments?.captures || [])
            .find((c) => c.status === 'COMPLETED');
        const valido = resultado.id === orderId &&
            resultado.status === 'COMPLETED' &&
            captura?.amount?.currency_code === 'MXN' &&
            Math.round(Number(captura?.amount?.value) * 100) === Math.round(venta.total * 100);

        if (!valido) {
            await consultar("UPDATE ventas SET estado = 'REVISION' WHERE id = ?", [venta.id]);
            return res.status(409).json({ mensaje: 'Pago pendiente de verificacion' });
        }

        // actualiza la venta y envía el recibo
        const datos = await ventaService.completarVenta(venta.id);
        const correoEnviado = await correoService.enviarRecibo({ ...datos, captureId: captura.id });

        res.json({
            mensaje: 'Pago completado', orderId, captureId: captura.id,
            estado: 'PAGADA', folio: datos.factura.folio, correoEnviado
        });
    } catch (error) {
        console.error(error);
        // requiere revisar el pago porque pudo completarse en paypal
        await consultar("UPDATE ventas SET estado = 'REVISION' WHERE paypal_order_id = ? AND estado = 'PROCESANDO'", [orderId]);
        res.status(502).json({ mensaje: 'Verificar estado del pago' });
    }
}

module.exports = { crearOrden, capturarOrden };
