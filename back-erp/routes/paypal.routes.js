const express = require('express');
const router = express.Router();
const controlador = require('../controlador/paypal.controlador');

// crea una orden de pago
router.post('/orden', controlador.crearOrden);
// captura el pago de una orden aprobada
router.post('/capturar/:orderId', controlador.capturarOrden);

module.exports = router;
