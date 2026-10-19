const express = require('express');
const router = express.Router();
const compraService = require('../services/compra.service');

// GET /api/compras?desde=2026-10-01&hasta=2026-10-31
router.get('/', async (req, res) => {
    res.json(await compraService.obtenerCompras(req.query.desde, req.query.hasta));
});

router.post('/', async (req, res) => {
    const compra = await compraService.registrarCompra(req.usuario.id, req.body);
    res.status(201).json({ mensaje: 'Compra registrada', ...compra });
});

module.exports = router;
