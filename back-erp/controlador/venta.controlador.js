const ventaService = require('../services/venta.service');
const correoService = require('../services/correo.service');

// POST /api/ventas: venta en efectivo (la de PayPal esta en paypal.controlador.js)
async function registrarVentaEfectivo(req, res) {
    const { ventaId } = await ventaService.crearVenta(req.usuario.id, { ...req.body, metodoPago: 'efectivo' });
    const datos = await ventaService.completarVenta(ventaId);
    const correoEnviado = await correoService.enviarRecibo(datos); // el XML se manda por correo
    res.status(201).json({ mensaje: 'Venta registrada', folio: datos.factura.folio, total: datos.venta.total, correoEnviado });
}

// GET /api/ventas?desde=&hasta=: historial
async function obtenerVentas(req, res) {
    res.json(await ventaService.obtenerVentas(req.usuario, req.query.desde, req.query.hasta));
}

// POST /api/ventas/:id/reenviar: vuelve a mandar el comprobante por correo
async function reenviarComprobante(req, res) {
    const datos = await ventaService.obtenerComprobante(req.params.id, req.usuario);
    const correoEnviado = await correoService.enviarRecibo(datos);
    res.json({ correoEnviado });
}

module.exports = { registrarVentaEfectivo, obtenerVentas, reenviarComprobante };
