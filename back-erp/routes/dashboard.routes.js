const express = require('express');
const router = express.Router();
const controlador = require('../controlador/dashboard.controlador');

router.get('/', controlador.obtenerResumen);

module.exports = router;
