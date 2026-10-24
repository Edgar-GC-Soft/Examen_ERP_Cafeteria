const express = require('express');
const router = express.Router();
const controlador = require('../controlador/proveedor.controlador');

router.get('/', controlador.obtenerProveedores);
router.post('/', controlador.agregarProveedor);
router.put('/:id', controlador.actualizarProveedor);

module.exports = router;
