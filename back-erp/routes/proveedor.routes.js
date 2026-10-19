const express = require('express');
const router = express.Router();
const proveedorService = require('../services/proveedor.service');

router.get('/', async (req, res) => {
    res.json(await proveedorService.obtenerProveedores());
});

router.post('/', async (req, res) => {
    const id = await proveedorService.agregarProveedor(req.body);
    res.status(201).json({ mensaje: 'Proveedor agregado', id });
});

router.put('/:id', async (req, res) => {
    await proveedorService.actualizarProveedor(req.params.id, req.body);
    res.json({ mensaje: 'Proveedor actualizado' });
});

module.exports = router;
