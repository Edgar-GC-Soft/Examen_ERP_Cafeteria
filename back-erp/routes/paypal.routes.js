const express = require('express');
const router = express.Router();
const controlador = require('../controlador/paypal.controlador');

router.post('/orden', controlador.crearOrden);
router.post('/capturar/:orderId', controlador.capturarOrden);

module.exports = router;
