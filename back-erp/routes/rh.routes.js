const express = require('express');
const router = express.Router();
const controlador = require('../controlador/rh.controlador');

router.get('/asistencias', controlador.obtenerAsistencias);
router.post('/llegada', controlador.registrarLlegada);
router.post('/salida', controlador.registrarSalida);
router.get('/nominas', controlador.obtenerNominas);
router.post('/nominas', controlador.pagarNomina);

module.exports = router;
