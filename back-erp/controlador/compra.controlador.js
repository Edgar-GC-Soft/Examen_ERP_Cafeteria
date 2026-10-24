const compraService = require('../services/compra.service');

// GET /api/compras?desde=2026-10-01&hasta=2026-10-31
async function obtenerCompras(req, res) {
    res.json(await compraService.obtenerCompras(req.query.desde, req.query.hasta));
}

async function registrarCompra(req, res) {
    const compra = await compraService.registrarCompra(req.usuario.id, req.body);
    res.status(201).json({ mensaje: 'Compra registrada', ...compra });
}

module.exports = { obtenerCompras, registrarCompra };
