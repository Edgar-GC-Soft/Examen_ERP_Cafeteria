const express = require('express');
const router = express.Router();
const { permitir } = require('../middleware/auth');
const productoService = require('../services/producto.service');

// GET: catalogo (admin y cliente)
router.get('/', async (req, res) => {
    res.json(await productoService.obtenerProductos(req.usuario.rol));
});

// POST, PUT y DELETE: solo admin
router.post('/', permitir('admin'), async (req, res) => {
    const id = await productoService.agregarProducto(req.body);
    res.status(201).json({ mensaje: 'Producto agregado', id });
});

router.put('/:id', permitir('admin'), async (req, res) => {
    await productoService.actualizarProducto(req.params.id, req.body);
    res.json({ mensaje: 'Producto actualizado' });
});

router.delete('/:id', permitir('admin'), async (req, res) => {
    await productoService.eliminarProducto(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
});

module.exports = router;
