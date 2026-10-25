const { paypalRequest } = require('../services/paypal.service');
const ventaService = require('../services/venta.service');
const correoService = require('../services/correo.service');
const { consultar } = require('../config/db');

async function crearOrden(req, res) {
    try {
        console.log('0. llego la peticion, usuario', req.usuario?.id, 'productos:', JSON.stringify(req.body.productos));
        const { ventaId, total } = await ventaService.crearVenta(req.usuario.id, { ...req.body, metodoPago: 'paypal' });
        console.log('1. venta creada', ventaId, 'total', total);

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
        await consultar('UPDATE ventas SET paypal_order_id = ? WHERE id = ?', [orden.id, ventaId]);
        console.log('3. orden guardada');
        // liga de la pagina de PayPal donde el cliente inicia sesion y paga
        const liga = orden.links.find((l) => l.rel === 'payer-action');
        if (!liga) {
            throw new Error('PayPal no devolvio la liga de pago');
        }
        res.json({ id: orden.id, total, urlPago: liga.href });
    } catch (error) {
        if (error.status) throw error; // errores de validacion (400, 409...)
        console.error(error);
        res.status(502).json({ mensaje: 'No se pudo crear la orden' });
    }
}

async function capturarOrden(req, res) {
    const { orderId } = req.params;
    try {
        // recuperar la orden local (solo la del usuario que la creo)
        const [venta] = await consultar(
            'SELECT * FROM ventas WHERE paypal_order_id = ? AND cliente_id = ?', [orderId, req.usuario.id]
        );
        if (!venta) {
            return res.status(404).json({ mensaje: 'Orden no encontrada' });
        }
        // solo una peticion puede pasar de CREADA a PROCESANDO
        const paso = await consultar("UPDATE ventas SET estado = 'PROCESANDO' WHERE id = ? AND estado = 'CREADA'", [venta.id]);
        if (paso.affectedRows === 0) {
            return res.status(409).json({ mensaje: 'La orden ya fue procesada' });
        }

        // solicitar captura a PayPal
        const resultado = await paypalRequest(`/v2/checkout/orders/${orderId}/capture`, 'POST');

        // verificar estado e importe
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

        // registrar el pago en la bd (stock, ingreso y XML) y mandar el correo con el recibo
        const datos = await ventaService.completarVenta(venta.id);
        const correoEnviado = await correoService.enviarRecibo({ ...datos, captureId: captura.id });

        res.json({
            mensaje: 'Pago completado', orderId, captureId: captura.id,
            estado: 'PAGADA', folio: datos.factura.folio, correoEnviado
        });
    } catch (error) {
        console.error(error);
        // no asumir que el pago fallo
        await consultar("UPDATE ventas SET estado = 'REVISION' WHERE paypal_order_id = ? AND estado = 'PROCESANDO'", [orderId]);
        res.status(502).json({ mensaje: 'Verificar estado del pago' });
    }
}

module.exports = { crearOrden, capturarOrden };
