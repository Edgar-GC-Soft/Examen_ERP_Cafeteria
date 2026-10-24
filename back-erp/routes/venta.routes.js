const express = require('express');
const router = express.Router();
const controlador = require('../controlador/venta.controlador');

router.post('/', controlador.registrarVentaEfectivo);
router.get('/', controlador.obtenerVentas);
router.post('/:id/reenviar', controlador.reenviarComprobante);

module.exports = router;
