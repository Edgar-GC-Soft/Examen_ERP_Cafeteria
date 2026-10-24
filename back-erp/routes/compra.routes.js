const express = require('express');
const router = express.Router();
const controlador = require('../controlador/compra.controlador');

router.get('/', controlador.obtenerCompras);
router.post('/', controlador.registrarCompra);

module.exports = router;
