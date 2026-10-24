const express = require('express');
const router = express.Router();
const { permitir } = require('../middleware/auth');
const controlador = require('../controlador/producto.controlador');

// GET: catalogo (admin y cliente)
router.get('/', controlador.obtenerProductos);

// POST, PUT y DELETE: solo admin
router.post('/', permitir('admin'), controlador.agregarProducto);
router.put('/:id', permitir('admin'), controlador.actualizarProducto);
router.delete('/:id', permitir('admin'), controlador.eliminarProducto);

module.exports = router;
