const express = require('express');
const router = express.Router();
const productoService = require('../services/producto.service');

// GET: ver todos los productos
router.get('/', (req, res) => {
    productoService.obtenerProductos((error, productos) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al consultar productos' });
        }
        res.json(productos);
    });
});

// POST: agregar un producto
router.post('/', (req, res) => {
    productoService.agregarProducto(req.body, (error, resultado) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al agregar producto' });
        }
        res.json({ mensaje: 'Producto agregado', id: resultado.insertId });
    });
});

// DELETE: eliminar un producto por id
router.delete('/:id', (req, res) => {
    productoService.eliminarProducto(req.params.id, (error, resultado) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al eliminar producto' });
        }
        res.json({ mensaje: 'Producto eliminado' });
    });
});
// PUT: actualizar un producto por id
router.put('/:id', (req, res) => {
    productoService.actualizarProducto(req.params.id, req.body, (error, resultado) => {
        if (error) {
            return res.status(500).json({ mensaje: 'Error al actualizar producto' });
        }
        res.json({ mensaje: 'Producto actualizado' });
    });
});
module.exports = router;