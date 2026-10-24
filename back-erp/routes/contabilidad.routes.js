const express = require('express');
const router = express.Router();
const controlador = require('../controlador/contabilidad.controlador');

router.get('/', controlador.obtenerTransacciones);
router.get('/xml', controlador.descargarXml);

module.exports = router;
